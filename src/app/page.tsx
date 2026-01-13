import { Calendar } from "@/components/Calendar";
import { QuoteDisplay } from "@/components/QuoteDisplay";
import { CommentForm } from "@/components/CommentForm";

export default function Home() {
  return (
    <div className="flex flex-col items-center p-4 sm:p-8">
      <Calendar className="w-full" />
      
      <div className="mt-8 w-full max-w-md text-center">
        <QuoteDisplay />
      </div>

      <CommentForm />
    </div>
  );
}
