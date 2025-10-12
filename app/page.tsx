// import { ModeToggle } from "@/components/theme-toggle";
// import Image from "next/image";


// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-poppins)]">
//       {/* <ModeToggle /> */}
//       <h1 className="text-primary font-bold text-6xl">Wealth.</h1>
//       <h3>Money moves made simple.</h3>
//       <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
//         <Image width={50} height={50} src="https://images.unsplash.com/photo-1581139196946-6c4f026acaa0?q=80&w=424&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt=""/>
//       </main>
//     </div>
//   );
// }
"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";
import GlassmorphismNavbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="bg-background text-primary min-h-screen">
      <GlassmorphismNavbar />

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-30">
        <h1 className="text-4xl sm:text-8xl font-bold text-accent-foreground/90 dark:text-primary">
          Wealth.
        </h1>
        <div className="fixed right-2 bottom-2">
          <ModeToggle/>   
        </div>
        <p className="mt-6 text-2xl sm:text-3xl text-primary font-semibold font-[family-name:var(--font-poppins)] max-w-2xl">
          Money moves made simple.
        </p>

        {/* Dashboard mockup */}
        <div className="mt-20 relative w-full max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl blur-3xl opacity-70" />
          <Image
            src="https://images.unsplash.com/photo-1581139196946-6c4f026acaa0?q=80&w=1600&auto=format&fit=crop"
            alt="Finance Dashboard"
            width={1600}
            height={900}
            className="relative rounded-2xl shadow-2xl"
            priority
          />
        </div>
      </section>

      {/* FEATURE: Conversational */}
      <section className="px-6 sm:px-20 py-28 max-w-6xl mx-auto space-y-24">
        <div className="grid sm:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-primary">
              Ever wonder <span className="italic text-secondary">where your money goes?</span>
            </h2>
            <p className="text-lg text-secondary leading-relaxed">
              We’ll show you — <span className="font-semibold text-primary">instantly</span>.  
              Track your <span className="text-accent font-medium">income</span>,{" "}
              <span className="text-green-500 font-medium">spending</span>, and{" "}
              <span className="text-pink-500 font-medium">savings</span> in a way that feels human.
            </p>
          </div>
          <Image
            src="https://dummyimage.com/600x400/eee/aaa"
            alt="Money Tracking"
            width={600}
            height={400}
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* FEATURE: Masonry Grid Showcase */}
      <section className="px-6 sm:px-20 py-28 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-primary text-center">
          Designed for <span className="text-secondary">clarity</span>.
        </h2>
        <p className="text-lg text-secondary text-center max-w-2xl mx-auto mb-16">
          Our platform adapts to how you think about money. Clean visuals,  
          smart layouts, and a design that feels effortless.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="grid gap-4">
              <div>
                <Image
                  src={`https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-${
                    (i % 12) + 1
                  }.jpg`}
                  alt={`Finance screenshot ${i + 1}`}
                  width={400}
                  height={400}
                  className="h-auto max-w-full rounded-lg shadow-md"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="text-center py-32 bg-gray-50">
        <h2 className="text-5xl font-extrabold mb-8 text-primary">
          Ready to build your wealth?
        </h2>
        <Button className="bg-primary text-white rounded-full px-10 py-6 text-lg font-medium hover:opacity-90 transition">
          Start Free Today
        </Button>
      </section>
    </div>
  );
}
