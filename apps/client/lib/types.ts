import { ReactNode } from "react";

export interface UserData {
    name: string;
    email: string;
    picture?: string;
}

export interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}
