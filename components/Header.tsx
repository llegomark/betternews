import clsx from "clsx";
import Image from "next/image";

export default function Header() {
  return (
    <div className="flex items-center justify-between px-3 sm:px-3">
      <a className="flex items-center space-x-3" href="/">
        <Image src="/betternews.svg" alt="better news logo" width={36} height={36} />
        <h2 className={clsx("text-lg sm:text-3xl")}>
          <span className="text-orange-600 font-bold">Better</span> <span className="font-bold">News</span>
        </h2>
      </a>
    </div>
  );
}
