import Link from "next/link";
import { Brain, Settings, FileText, Cog } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Vibe Remote Workstation
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Configure your AI development environment for autonomous coding with 
                        intelligent context and powerful automations.
                    </p>
                </div>

                {/* Main Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* AI Context Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center mb-6">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                                    <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    AI Context
                                </h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                Define your project context and coding standards to give AI assistants 
                                the perfect understanding of your requirements and style preferences.
                            </p>
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Project Context & Goals
                                </div>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Coding Standards & Guidelines
                                </div>
                            </div>
                            <Link
                                href="/ai-context"
                                className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                            >
                                <Settings className="w-5 h-5 mr-2" />
                                Configure AI Context
                            </Link>
                        </div>
                    </div>

                    {/* Automations Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center mb-6">
                                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg mr-4">
                                    <Cog className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Automations
                                </h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                Configure automated workflows to streamline your development process 
                                with intelligent PR creation and code review capabilities.
                            </p>
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Cog className="w-4 h-4 mr-2" />
                                    Automatic PR Creation
                                </div>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Cog className="w-4 h-4 mr-2" />
                                    AI Code Review Process
                                </div>
                            </div>
                            <Link
                                href="/automations"
                                className="inline-flex items-center justify-center w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                            >
                                <Cog className="w-5 h-5 mr-2" />
                                Configure Automations
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Feature Overview */}
                <div className="mt-16 text-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="p-4">
                            <div className="text-3xl mb-2">🤖</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Smart Context
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                AI understands your project goals and coding style
                            </p>
                        </div>
                        <div className="p-4">
                            <div className="text-3xl mb-2">⚡</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Auto Workflows
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Automated PR creation and code review processes
                            </p>
                        </div>
                        <div className="p-4">
                            <div className="text-3xl mb-2">🎯</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Consistent Quality
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Maintain code quality with intelligent automation
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
