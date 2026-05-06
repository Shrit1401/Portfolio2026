import React from "react";

const ResearchText = ({
  title,
  time,
  date,
}: {
  title: string;
  time: string;
  date: string;
}) => {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-6 pt-14 md:pt-16">
      <h1
        className="text-4xl font-semibold leading-[1.04] tracking-tight text-neutral-900 md:text-5xl lg:text-[3.1rem]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h1>
      <p
        className="mt-4 text-sm leading-relaxed text-neutral-500 md:text-base"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}
      >
        {formattedDate} &nbsp;·&nbsp; {time}
      </p>
      <hr className="mt-6 border-t border-neutral-200/90" />
    </div>
  );
};

export default ResearchText;
