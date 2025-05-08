"use client";
import { slideInFromLeft, slideInFromRight } from "@/utils/motion";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useInView } from "react-intersection-observer";
import { Button } from "../ui/button";

const Hero = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    const { ref, inView } = useInView({
        triggerOnce: true,
    });

    useEffect(() => {
        // Check if the user is logged in by verifying the presence of a token or user data
        const token = document.cookie.includes("accesstoken");
        setIsLoggedIn(token);
    }, []);

    const handlePlayNowClick = () => {
        if (isLoggedIn) {
            router.push("/dashboard");
        } else {
            router.push("/login");
        }
    };

    return (
        <div className="flex flex-col justify-center text-white">
            <section className="container mx-auto max-w-7xl px-4 py-16">
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    className="grid md:grid-cols-2 gap-16 items-center"
                >
                    <div className="space-y-8">
                        <motion.h1
                            variants={slideInFromLeft(0.2)}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
                        >
                            Master the Game of{" "}
                            <span className="text-green-400">Kings</span>
                        </motion.h1>
                        <motion.p
                            variants={slideInFromLeft(0.5)}
                            className="text-xl md:text-2xl text-gray-300 leading-relaxed"
                        >
                            Elevate your chess skills with our modern platform.
                            Play, learn, and compete with players from around
                            the world.
                        </motion.p>
                        <motion.div variants={slideInFromLeft(0.8)}>
                            <Button
                                size="lg"
                                onClick={handlePlayNowClick}
                                // disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer text-lg flex gap-1 items-center"
                            >
                                <span>Play Now </span>
                                <ChevronRight size={18} />
                            </Button>
                        </motion.div>
                    </div>
                    <motion.div
                        variants={slideInFromRight(0.8)}
                        className="relative h-[350px] md:h-[450px] w-full"
                    >
                        <Chessboard
                            customDarkSquareStyle={{
                                backgroundColor: "#8aad6a",
                            }}
                            customLightSquareStyle={{
                                backgroundColor: "#f0e9c5",
                            }}
                            arePiecesDraggable={false}
                            position="start"
                            customBoardStyle={{
                                width: "100%",
                                height: "100%",
                                maxWidth: "450px",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                            }}
                        />
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
};

export default Hero;
