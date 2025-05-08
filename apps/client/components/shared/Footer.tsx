import Link from "next/link";

const Footer = () => {
    return (
        <footer className="py-8 bg-zinc-950 border-t border-zinc-800">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <span className="text-xl font-bold text-white">
                            Chess<span className="text-green-400">Masters</span>
                        </span>
                    </div>
                    <div className="flex gap-6">
                        <Link
                            href="#"
                            className="text-gray-400 hover:text-green-400"
                        >
                            About
                        </Link>
                        <Link
                            href="#"
                            className="text-gray-400 hover:text-green-400"
                        >
                            Terms
                        </Link>
                        <Link
                            href="#"
                            className="text-gray-400 hover:text-green-400"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="#"
                            className="text-gray-400 hover:text-green-400"
                        >
                            Contact
                        </Link>
                    </div>
                </div>
                <div className="text-center mt-8 text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Chess Masters. All rights
                    reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
