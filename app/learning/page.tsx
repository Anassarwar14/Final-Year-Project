"use client";

import { useState } from "react";

const courses = [
  { id: 1, title: "Beginner Finance", description: "Basics of investing, saving, and stock markets." },
  { id: 2, title: "Intermediate Finance", description: "Portfolio strategies, risk management, and crypto fundamentals." },
  { id: 3, title: "Advanced Finance", description: "Deep dive into derivatives, technical analysis, and trading psychology." },
];

const blogs = [
  { id: 1, title: "Getting Started with Stocks", category: "Stocks" },
  { id: 2, title: "Crypto 101: Bitcoin & Ethereum Basics", category: "Crypto" },
  { id: 3, title: "Top 5 Mistakes New Investors Make", category: "Stocks" },
  { id: 4, title: "DeFi Explained", category: "Crypto" },
];

export default function LearningPage() {
  const [search, setSearch] = useState("");

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-orange-500 mb-6">Learning Hub</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search courses or blogs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-8 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      {/* Courses Section */}
      <h2 className="text-2xl font-semibold mb-4">Courses</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-lg border bg-white shadow-md p-4 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-bold mb-2">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{course.description}</p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${course.id * 30}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Progress: {course.id * 30}%
            </p>
          </div>
        ))}
      </div>

      {/* Blogs Section */}
      <h2 className="text-2xl font-semibold mt-12 mb-4">Blogs</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {filteredBlogs.map((blog) => (
          <div
            key={blog.id}
            className="rounded-lg border bg-white shadow-sm p-4 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold mb-2">{blog.title}</h3>
            <span className="text-xs text-orange-500 font-medium">
              {blog.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
