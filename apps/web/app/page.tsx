import Link from "next/link";
import { Brain, Cog, Kanban } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Vibe 🤮 Remote 🚀
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Configure your AI development environment for autonomous coding with 
                        intelligent context and powerful automations.
                    </p>
                </div>

                {/* Main Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* AI Context Card */}
                    <Link href="/ai-context" className="group">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform group-hover:scale-105">
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
                                    Configure project goals and coding standards that are giving Claude Code beter context understanding.
                                </p>
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                                        Project Goals & Requirements
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                                        Development Preferences
                                    </div>
                                </div>
                                <div className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg group-hover:bg-blue-700 transition-colors duration-200 font-medium">
                                    <Brain className="w-5 h-5 mr-2" />
                                    Configure AI Context
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Automations Card */}
                    <Link href="/automations" className="group">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform group-hover:scale-105">
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
                                    Enable autonomous development workflows with code reviews, PR creation, 
                                    automatic merging and ai-assisted task selection.
                                </p>
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                                        Code Reviews Before Finishing Tasks
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                                        AI Assisted Task Picking
                                    </div>
                                </div>
                                <div className="inline-flex items-center justify-center w-full px-6 py-3 bg-green-600 text-white rounded-lg group-hover:bg-green-700 transition-colors duration-200 font-medium">
                                    <Cog className="w-5 h-5 mr-2" />
                                    Configure Automations
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Vibe Kanban Card */}
                    <Link href="/vibe-kanban" className="group md:col-span-2 lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform group-hover:scale-105">
                            <div className="p-8">
                                <div className="flex items-center mb-6">
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg mr-4">
                                        <Kanban className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Vibe Kanban
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                    Visual task management with three specialized AI agents: VIBE, VIBE_FLOW, 
                                    and VIBE_PLAN for different development workflows.
                                </p>
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                                        Three Specialized AI Agents
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                                        Claude Code Integration
                                    </div>
                                </div>
                                <div className="inline-flex items-center justify-center w-full px-6 py-3 bg-purple-600 text-white rounded-lg group-hover:bg-purple-700 transition-colors duration-200 font-medium">
                                    <Kanban className="w-5 h-5 mr-2" />
                                    Open Vibe Kanban
                                </div>
                            </div>
                        </div>
                    </Link>
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
                                Code reviews, PR creation, automatic merging and ai-assisted task selection
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