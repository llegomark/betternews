import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Link from "next/link";

export const Home: NextPage = () => {
  const [response, setResponse] = useState<Record<string, unknown> | null>(
    null
  );
  const router = useRouter();
  const urlState = router.query.slug;
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [curArticle, setCurArticle] = useState<string>("");

  useEffect(() => {
    if (
      urlState &&
      router.isReady &&
      !curArticle &&
      typeof urlState !== "string" &&
      urlState.every((subslug: string) => typeof subslug === "string")
    ) {
      generateSummary(
        "https://www.rappler.com/" + (urlState as string[]).join("/")
      );
    }
  }, [router.isReady, urlState]);

  const curUrl = String(curArticle.split(".com")[1]);

  const generateSummary = async (url?: string) => {
    setSummary("");
    if (url) {
      if (!url.includes("rappler.com")) {
        toast.error("Please enter a valid Rappler news article URL");
        return;
      }
      setCurArticle(url);
    } else {
      if (!curArticle.includes("rappler.com")) {
        toast.error("Please enter a valid Rappler news article URL");
        return;
      }
      router.replace(curUrl);
    }
    setLoading(true);
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url ? url : curArticle }),
    });

    if (!response.ok) {
      setResponse({
        status: response.status,
        body: await response.text(),
        headers: {
          "X-Ratelimit-Limit": response.headers.get("X-Ratelimit-Limit"),
          "X-Ratelimit-Remaining": response.headers.get(
            "X-Ratelimit-Remaining"
          ),
          "X-Ratelimit-Reset": response.headers.get("X-Ratelimit-Reset"),
        },
      });
      setLoading(false);
      alert(`Rate limit reached, try again after one minute.`);
      return;
    }

    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setSummary((prev) => prev + chunkValue);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col pt-8 sm:pt-12">
      <Head>
        <title>
          Stay Informed With AI-Powered, Impartial News Summaries - Better News
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="mx-auto mt-10 flex max-w-5xl flex-1 flex-col justify-center px-2 sm:mt-10">
        <h2 className="max-w-5xl text-center text-4xl font-bold sm:text-7xl md:text-6xl lg:text-7xl">
          Effortless News Reading with Artificial Intelligence (AI)
        </h2>
        <p className="mt-10 text-center text-lg text-gray-500 sm:text-2xl md:text-xl lg:text-2xl">
          Simply copy and paste any{" "}
          <Link
            href="https://www.rappler.com/"
            target={"_blank"}
            rel="noopener noreferrer"
            className="font-bold text-orange-500 underline-offset-2 transition hover:underline"
          >
            Rappler
          </Link>{" "}
          news article link below to get started.
        </p>
        <input
          type="text"
          value={curArticle}
          onChange={(e) => setCurArticle(e.target.value)}
          className="mx-auto mt-10 w-full rounded-lg border border-gray-500 bg-black p-3 outline-1 outline-white sm:w-3/4 lg:w-full"
        />
        {!loading && (
          <button
            className="z-10 mx-auto mt-7 w-3/4 rounded-2xl border-gray-500 bg-orange-600 p-3 text-lg font-bold transition hover:bg-orange-400 sm:mt-10 sm:w-1/3"
            onClick={() => generateSummary()}
          >
            Summarize
          </button>
        )}
        {loading && (
          <button
            className="z-10 mx-auto mt-7 w-3/4 cursor-not-allowed rounded-2xl border-gray-500 bg-orange-500 p-3 text-lg font-medium transition hover:bg-orange-400 sm:mt-10 sm:w-1/3"
            disabled
          >
            <div className="flex items-center justify-center text-white">
              <Image
                src="/loading.svg"
                alt="Loading..."
                width={28}
                height={28}
              />
            </div>
          </button>
        )}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        {summary && (
          <div className="mb-10 px-4">
            <h2 className="mx-auto mt-16 max-w-3xl border-t border-gray-600 pt-8 text-center text-3xl font-bold sm:text-5xl">
              Summary
            </h2>
            <div className="mx-auto mt-6 max-w-3xl text-lg leading-7">
              {summary.split(/\d+\.\s/).map((sentence, index) => (
                <p key={index} className="my-3">
                  {sentence}
                </p>
              ))}
            </div>
            <div className="mx-auto mt-6 max-w-3xl text-lg leading-7">
              <p className="mt-2 flex rounded-lg bg-yellow-200 p-3 text-justify text-xs font-light leading-tight text-yellow-800">
                <span className="md:pl-2">
                  Disclaimer: This is an AI-generated summary of the original
                  article. It is not intended to replace the original content.
                  Accuracy and impartiality are not guaranteed. If you are not
                  satisfied with the summary, simply click the "Summarize"
                  button again for a new version.
                </span>
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;