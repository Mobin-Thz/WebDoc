import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Subject } from "@/payload-types";
import { MediaView } from "./MediaView";

type SubjectCardProps = Readonly<{ subject: Subject }>;

export function SubjectCard({ subject }: SubjectCardProps) {
  const subjectURL = `/subjects/${subject.slug}`;
  return (
    <Card className="subject-card">
      <MediaView media={subject.coverImage} />
      <CardHeader>
        <Badge variant="secondary">Subject</Badge>
        <CardTitle><Link href={subjectURL}>{subject.title}</Link></CardTitle>
      </CardHeader>
      <CardContent><p>{subject.description}</p></CardContent>
      <CardFooter>
        <Link className={buttonVariants({ variant: "link" })} href={subjectURL}>Explore subject →</Link>
      </CardFooter>
    </Card>
  );
}
