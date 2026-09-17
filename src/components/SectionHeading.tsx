export function SectionHeading({
  index,
  eyebrow,
  title,
  align = "left",
}: {
  index?: string;
  eyebrow: string;
  title: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <div className="section-heading__meta">
        {index ? <span>{index}</span> : null}
        <span>{eyebrow}</span>
      </div>
      <h2>{title}</h2>
    </div>
  );
}