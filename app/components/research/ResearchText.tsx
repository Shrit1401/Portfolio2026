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
    <div className="w-full max-w-3xl mx-auto px-6 pt-16 pb-8">
      <h1
        className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-tight tracking-tight text-neutral-900"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h1>
      <p
        className="mt-5 text-lg text-neutral-500 leading-relaxed"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}
      >
        {formattedDate} &nbsp;·&nbsp; {time}
      </p>
      <hr className="mt-8 border-t border-neutral-200" />
    </div>
  );
};

export default ResearchText;
