import { Calendar } from "@/components/Calendar";
import { ClientSessionId } from "@/components/ClientSessionId";
import { QuoteDisplay } from "@/components/QuoteDisplay";

export default function Home() {
  return (
    <div className="flex flex-col items-center p-4 sm:p-8">
      <Calendar className="w-full" />
      
      <div className="mt-8 w-full max-w-md text-center">
        <QuoteDisplay />
      </div>
      <footer className="mt-12 text-[10px] text-gray-300 font-mono">
        Session ID: <SessionIdDisplay />
      </footer>
    </div>
  );
}

function SessionIdDisplay() {
  return (
    <span className="select-all cursor-copy opacity-50 hover:opacity-100 transition-opacity">
      {/* 
        Client-only component to show the ID from context/localStorage 
        Since Home is a Server Component by default, we use a small client wrapper
      */}
      <ClientSessionId />
    </span>
  );
}
