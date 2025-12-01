"use client";

import { useEffect, useState } from "react";
import { Plus, Check, X } from "lucide-react";

interface Problem {
  id: number;
  lcId: string;
  title: string;
  url: string;
}

interface ProblemStatus {
  pid: number;
  dailyCount: number;
  daily: string[];
}

export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [status, setStatus] = useState<ProblemStatus[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newProblem, setNewProblem] = useState({
    id: 0,
    lcId: "",
    title: "",
    url: ""
  });

  // Load data
  const fetchData = async () => {
    const res = await fetch("/api/problems");
    const data = await res.json();
    setProblems(data.problems);
    setStatus(data.status);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add problem
  const addProblem = async () => {
    await fetch("/api/problems/add", {
      method: "POST",
      body: JSON.stringify(newProblem),
    });
    setNewProblem({ id: 0, lcId: "", title: "", url: "" });
    setShowAddModal(false);
    fetchData();
  };

  // Mark as done
  const markAsDone = async (problemId: number) => {
    const existingStatus = status.find((s) => s.pid === problemId);
    const today = new Date().toISOString().split("T")[0];
    
    await fetch("/api/problems/status", {
      method: "POST",
      body: JSON.stringify({
        pid: problemId,
        dailyCount: (existingStatus?.dailyCount || 0) + 1,
        daily: [...(existingStatus?.daily || []), today],
      }),
    });
    fetchData();
  };

  // Get filtered problems
  const getFilteredProblems = () => {
    if (activeTab === "pending") {
      return problems.filter((p) => {
        const s = status.find((st) => st.pid === p.id);
        return !s || s.dailyCount === 0;
      });
    }
    if (activeTab === "completed") {
      return problems.filter((p) => {
        const s = status.find((st) => st.pid === p.id);
        return s && s.dailyCount > 0;
      });
    }
    return problems;
  };

  const filteredProblems = getFilteredProblems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">LeetCode Tracker</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            Add Problem
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "all"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            All Problems ({problems.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "pending"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Pending ({problems.filter(p => !status.find(s => s.pid === p.id)?.dailyCount).length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "completed"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Completed ({problems.filter(p => status.find(s => s.pid === p.id)?.dailyCount).length})
          </button>
        </div>
      </div>

      {/* Problem List */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No problems in this category
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProblems.map((p) => {
              const s = status.find((st) => st.pid === p.id);
              const isDone = s && s.dailyCount > 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                          #{p.lcId}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {p.title}
                        </h3>
                        {isDone && (
                          <span className="flex items-center gap-1 text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                            <Check size={14} />
                            Done
                          </span>
                        )}
                      </div>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {p.url}
                      </a>
                      <div className="mt-2 text-sm text-gray-600">
                        Completed: {s?.dailyCount || 0} time(s)
                      </div>
                    </div>
                    
                    {activeTab === "pending" && (
                      <button
                        onClick={() => markAsDone(p.id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition ml-4"
                      >
                        <Check size={18} />
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Problem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Problem</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Problem ID
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                  value={newProblem.id || ""}
                  onChange={(e) =>
                    setNewProblem({ ...newProblem, id: Number(e.target.value) })
                  }
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LeetCode ID
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123"
                  value={newProblem.lcId}
                  onChange={(e) =>
                    setNewProblem({ ...newProblem, lcId: e.target.value })
                  }
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Two Sum"
                  value={newProblem.title}
                  onChange={(e) =>
                    setNewProblem({ ...newProblem, title: e.target.value })
                  }
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://leetcode.com/problems/..."
                  value={newProblem.url}
                  onChange={(e) =>
                    setNewProblem({ ...newProblem, url: e.target.value })
                  }
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={addProblem}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Add Problem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}