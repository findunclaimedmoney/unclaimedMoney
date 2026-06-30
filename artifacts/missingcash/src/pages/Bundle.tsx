import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Bundle() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate("/guides"); }, [navigate]);
  return null;
}
