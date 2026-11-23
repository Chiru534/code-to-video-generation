"""Measure the AI-engineering candidate slate. Run after quota reset (13:30 IST).

search.list = 100 units per query. 22 queries = 2,200 units, which leaves
7,800 for uploads (3 videos with captions = ~6,150).

Every query here is a question a developer would actually type. Head terms
like "what is rag" are deliberately excluded: they are owned by IBM and AWS
and a 5-sub channel cannot rank against them. We are looking for the band
where the incumbents are weak, which is where the earlier research found
quantization (27K median) and kv cache (18K).
"""
import io, json, os, statistics, time
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

STORE = os.path.join(os.environ["LOCALAPPDATA"], "c2v")
d = json.load(io.open(os.path.join(STORE, "yt_token.json"), encoding="utf-8"))
c = Credentials(token=None, refresh_token=d["refresh_token"], token_uri=d["token_uri"],
                client_id=d["client_id"], client_secret=d["client_secret"], scopes=d["scopes"])
c.refresh(Request())
yt = build("youtube", "v3", credentials=c, cache_discovery=False)

QUERIES = [
    "rag vs cag",                       # already measured: median 13,328
    "what is cache augmented generation",
    "rag chunking strategies",
    "fine tuning vs rag",
    "why does my rag not work",
    "what is a vector database",
    "how do embeddings work",
    "cosine similarity embeddings",
    "llm context window explained",
    "lost in the middle llm",
    "semantic cache llm",
    "what is a knowledge base in ai",
    "graphrag explained",
    "how to stop llm hallucination",
    "rag reranking",
    "what is mcp model context protocol",
    "llm temperature explained",
    "why is my rag slow",
    "hybrid search rag",
    "agentic rag explained",
    "what is a knowledge graph rag",
    "prompt caching explained",
]

out = {}
for q in QUERIES:
    try:
        sr = yt.search().list(part="id", q=q, type="video", order="relevance",
                              regionCode="US", relevanceLanguage="en",
                              maxResults=12).execute()
    except HttpError as e:
        print(f"STOPPED at '{q}': {e.status_code}. Re-run tomorrow.")
        break
    ids = [i["id"]["videoId"] for i in sr.get("items", []) if i.get("id", {}).get("videoId")]
    if not ids:
        print(f"{q:38} no results")
        continue
    vr = yt.videos().list(part="statistics,snippet", id=",".join(ids)).execute()
    rows = [{"id": v["id"], "title": v["snippet"]["title"],
             "channel": v["snippet"]["channelTitle"],
             "views": int(v["statistics"].get("viewCount", 0))} for v in vr.get("items", [])]
    rows.sort(key=lambda r: r["views"], reverse=True)
    views = [r["views"] for r in rows]
    out[q] = {"top": max(views), "median": int(statistics.median(views)),
              "over100k": sum(1 for x in views if x >= 100_000),
              "n": len(rows), "results": rows}
    print(f"{q:38} top={max(views):>10,} med={int(statistics.median(views)):>9,} "
          f">100K={out[q]['over100k']}/{len(rows)}")
    for r in rows[:2]:
        print(f"    {r['views']:>9,}  {r['channel'][:26]:26} {r['title'][:50]}")
    time.sleep(0.2)

p = os.path.join(STORE, "topic_relevance_ai_eng.json")
json.dump(out, io.open(p, "w", encoding="utf-8"), indent=2)
ranked = sorted(out.items(), key=lambda kv: kv[1]["median"], reverse=True)
print(f"\n=== ranked by median ({len(out)} measured) ===")
for q, v in ranked:
    print(f"{v['median']:>9,}  {v['over100k']:>2}/{v['n']:<3} {q}")
print(f"\nwrote {p}")
