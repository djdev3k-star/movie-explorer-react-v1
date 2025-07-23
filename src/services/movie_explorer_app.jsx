import { useFireproofContext } from "../contexts/FireproofContext";
import { useState } from "react";

export default function App() {
  const { database, useDocument, useLiveQuery } = useFireproofContext();
  const { doc, merge, submit } = useDocument({ title: "", review: "", favorite: false, rating: "", flaggedScenes: [] });
  const { docs } = useLiveQuery("_id", { descending: true });
  const [filterFavs, setFilterFavs] = useState(false);
  const [filterRating, setFilterRating] = useState("");
  const [flagStart, setFlagStart] = useState("");
  const [flagEnd, setFlagEnd] = useState("");
  const [flagReason, setFlagReason] = useState("");

  const addDemoData = async () => {
    const demo = [
      { title: "Inception", review: "Mind-bending thriller.", favorite: true, rating: "PG-13", flaggedScenes: [] },
      { title: "The Matrix", review: "A sci-fi masterpiece.", favorite: true, rating: "R", flaggedScenes: [{ start: "00:15:20", end: "00:16:10", reason: "Violence" }] },
      { title: "Interstellar", review: "A space odyssey with heart.", favorite: false, rating: "PG-13", flaggedScenes: [] },
      { title: "The Room", review: "So bad it's good.", favorite: false, rating: "R", flaggedScenes: [] },
      { title: "Finding Nemo", review: "Great for kids.", favorite: true, rating: "G", flaggedScenes: [] }
    ];
    for (const movie of demo) await database.put(movie);
  };

  const addFlag = () => {
    if (flagStart && flagEnd && flagReason) {
      const newFlags = [...(doc.flaggedScenes || []), { start: flagStart, end: flagEnd, reason: flagReason }];
      merge({ flaggedScenes: newFlags });
      setFlagStart(""); setFlagEnd(""); setFlagReason("");
    }
  };

  const filteredDocs = docs.filter(doc => {
    if (filterFavs && !doc.favorite) return false;
    if (filterRating && doc.rating !== filterRating) return false;
    return true;
  });

  return (
    <div className="max-w-xl mx-auto p-4 bg-zinc-900 text-orange-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Movie Explorer</h1>
      <p className="italic text-sm mb-4">
        Explore and document your favorite movies. Add your own or load demo data. Toggle favorites, share reviews, and filter by homeschool-friendly ratings! Flag specific scenes to mark content for classroom editing.
      </p>
      <input
        className="w-full mb-2 p-2 rounded bg-zinc-800 border border-orange-400 text-orange-100"
        placeholder="Movie Title"
        value={doc.title}
        onChange={e => merge({ title: e.target.value })}
        onKeyDown={e => e.key === "Enter" && submit()}
      />
      <textarea
        className="w-full mb-2 p-2 rounded bg-zinc-800 border border-orange-400 text-orange-100"
        placeholder="Review"
        value={doc.review}
        onChange={e => merge({ review: e.target.value })}
      />
      <select
        className="w-full mb-2 p-2 rounded bg-zinc-800 border border-orange-400 text-orange-100"
        value={doc.rating}
        onChange={e => merge({ rating: e.target.value })}
      >
        <option value="">Select Rating</option>
        <option value="G">G - General</option>
        <option value="PG">PG - Parental Guidance</option>
        <option value="PG-13">PG-13 - Teens</option>
        <option value="R">R - Restricted</option>
      </select>

      <div className="bg-zinc-800 border border-orange-500 p-3 rounded mb-4">
        <p className="mb-2 font-semibold">Flag Inappropriate Scene</p>
        <div className="flex gap-2 mb-2">
          <input
            placeholder="Start (e.g. 00:14:32)"
            value={flagStart}
            onChange={e => setFlagStart(e.target.value)}
            className="flex-1 p-1 rounded bg-zinc-700 text-orange-100"
          />
          <input
            placeholder="End (e.g. 00:15:10)"
            value={flagEnd}
            onChange={e => setFlagEnd(e.target.value)}
            className="flex-1 p-1 rounded bg-zinc-700 text-orange-100"
          />
        </div>
        <input
          placeholder="Reason (e.g. Violence)"
          value={flagReason}
          onChange={e => setFlagReason(e.target.value)}
          className="w-full p-1 rounded bg-zinc-700 text-orange-100 mb-2"
        />
        <button
          onClick={addFlag}
          className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
        >
          Add Flag
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={doc.favorite} onChange={e => merge({ favorite: e.target.checked })} />
          Favorite
        </label>
        <button
          onClick={submit}
          className="bg-orange-600 text-white px-4 py-1 rounded hover:bg-orange-700"
        >
          Add Movie
        </button>
        <button
          onClick={addDemoData}
          className="bg-orange-400 text-white px-4 py-1 rounded hover:bg-orange-500"
        >
          Demo Data
        </button>
      </div>
      <div className="flex gap-2 items-center mb-4">
        <button
          onClick={() => setFilterFavs(!filterFavs)}
          className="text-sm underline text-orange-300 hover:text-orange-100"
        >
          {filterFavs ? "Show All" : "Show Favorites"}
        </button>
        <select
          value={filterRating}
          onChange={e => setFilterRating(e.target.value)}
          className="bg-zinc-800 text-orange-100 border border-orange-400 p-1 rounded"
        >
          <option value="">All Ratings</option>
          <option value="G">G</option>
          <option value="PG">PG</option>
          <option value="PG-13">PG-13</option>
          <option value="R">R</option>
        </select>
      </div>
      <ul className="space-y-3">
        {filteredDocs.map(m => (
          <li key={m._id} className="p-3 rounded bg-zinc-800 border border-orange-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{m.title}</h3>
              <button
                onClick={() => database.put({ ...m, favorite: !m.favorite })}
                className="text-sm text-orange-300 hover:text-orange-100"
              >
                {m.favorite ? "★" : "☆"}
              </button>
            </div>
            <p className="text-sm mt-1">{m.review}</p>
            {m.rating && <p className="text-xs mt-1 text-orange-400">Rated: {m.rating}</p>}
            {m.flaggedScenes?.length > 0 && (
              <div className="mt-2 text-sm">
                <p className="text-orange-300 font-semibold">⚠️ Flagged Scenes:</p>
                <ul className="ml-4 list-disc">
                  {m.flaggedScenes.map((f, i) => (
                    <li key={i}>{f.start} - {f.end}: {f.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
