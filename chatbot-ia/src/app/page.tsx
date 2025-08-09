"use client";
import Chat from "../../components/Chat";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-2xl mx-auto p-4 flex flex-col items-center">
        <header className="w-full flex justify-end p-4">

        </header>
        <div className="w-full">
          {/* El componente del chat está aquí */}
          <Chat />
        </div>
      </div>
    </main>
  );
}