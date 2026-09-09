import type { Metadata } from "next"
import { DemoApp } from "./_components/demo-app"

export const metadata: Metadata = {
  title: "演示仪表盘",
  description: "Northwind Analytics —— 一个真实可交互的 SaaS 仪表盘原型。",
}

export default function DemoPage() {
  return <DemoApp />
}