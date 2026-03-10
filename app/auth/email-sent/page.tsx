import { Suspense } from "react";
import EmailSent from "./EmailSent";

export default function EmailSentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailSent />
    </Suspense>
  );
}
