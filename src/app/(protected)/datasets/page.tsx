import React from "react";
import Link from "next/link";
import { getDb } from "@/lib/db/db";
import { Dataset } from "@/lib/db/entities/dataset.entity";

export default async function DatasetsPage() {
	const db = await getDb();
	const repo = db.getRepository(Dataset);
	const datasets = await repo.find({ order: { created_at: "DESC" } });

	return (
		<div className="flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
			<div className="w-full">
				<div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="text-center sm:text-left">
						<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
							Datasets Marketplace
						</h1>
						<p className="text-gray-600 mt-3 text-lg">
							Browse and purchase datasets for machine learning training.
						</p>
					</div>
					<Link
						className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg text-base font-bold shadow transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
						href="/my-datasets/upload"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-5 h-5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16"
							/>
						</svg>
						Upload Dataset
					</Link>
				</div>
				<div className="bg-white/80 shadow-xl rounded-2xl overflow-x-auto border border-blue-100">
					<table className="min-w-full  ">
						<thead className="bg-blue-50">
							<tr>
								<th className="px-8 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
									Name
								</th>
								<th className="px-8 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
									Description
								</th>
								<th className="px-8 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
									Price (HBAR)
								</th>
								<th className="px-8 py-4"></th>
							</tr>
						</thead>
						<tbody className="bg-white ">
							{datasets.length === 0 ? (
								<tr>
									<td colSpan={4} className="text-center py-8 text-gray-500">
										No datasets available.
									</td>
								</tr>
							) : (
								datasets.map((dataset) => (
									<tr key={dataset.id} className="hover:bg-blue-50/60 transition">
										<td className="px-8 py-6 whitespace-nowrap font-bold text-gray-900 text-lg">
											{dataset.title}
										</td>
										<td className="px-8 py-6 whitespace-nowrap text-gray-700 text-base max-w-xs">
											{dataset.description}
										</td>
										<td className="px-8 py-6 whitespace-nowrap text-blue-700 font-semibold text-base flex items-center gap-2 max-w-xs">
											<img src="/globe.svg" alt="HBAR" className="inline w-5 h-5 mr-1" />
											{dataset.price || "Free"}
										</td>
										<td className="px-8 py-6 whitespace-nowrap text-right">
											<Link
												href={`/datasets/${dataset.id}`}
												className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 rounded-lg text-sm font-bold shadow transition"
											>
												View
											</Link>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}