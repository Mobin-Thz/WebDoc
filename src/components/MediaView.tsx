import Image from "next/image";

import type { Media } from "@/payload-types";

export function MediaView({
  media,
  priority = false,
}: {
  media?: Media | number | null;
  priority?: boolean;
}) {
  if (!media || typeof media === "number" || !media.url) return null;
  if (media.mimeType === "application/pdf") {
    return (
      <a className="file-link" href={media.url}>
        Download {media.filename ?? "PDF"}
      </a>
    );
  }
  return (
    <figure className="media-view">
      <Image
        alt={media.alt}
        height={media.height ?? 800}
        priority={priority}
        sizes="(max-width: 800px) 100vw, 760px"
        src={media.sizes?.content?.url ?? media.url}
        width={media.width ?? 1200}
      />
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  );
}
