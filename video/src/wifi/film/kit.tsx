/* The Wi-Fi film's private kit used to live here.
 *
 * It was not private: it was the 16:9 kit, and every long-form video needs it.
 * It now lives at src/kit/film.tsx, unchanged, and this file re-exports it so
 * the shipped film renders exactly as before. Import from ../../kit/film in new
 * code. */

export * from "../../kit/film";
