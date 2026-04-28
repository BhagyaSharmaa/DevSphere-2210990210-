import Link from "next/link";
import Image from "next/image";
import { auth, signIn, signOut } from "@/auth";

const Navbar = async () => {
  const session = await auth();
  return (
    <div className="px-5 py-3 shadow-sm font-work-sans bg-blue-300">
      <nav className="flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.png" alt="logo" width={150} height={35} />
        </Link>

        <div className="flex items-center gap-5 text-black">
          {session && session?.user ? (
            <>
              <Link href="/?createPost=1">
                <span>Create a Post</span>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit">Logout</button>
              </form>
              <Link href={`/user/${session?.user?.githubLogin ?? ""}`}>
                <span>{session?.user?.name}</span>
              </Link>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button type="submit">Login</button>
            </form>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
