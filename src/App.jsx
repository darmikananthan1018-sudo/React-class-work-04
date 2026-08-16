import React, {
  useReducer,
  useRef,
  useContext,
  useMemo,
  useCallback,
  createContext,
  useEffect,
  useState,
} from "react";
import "./App.css";

/* ------------------------------------------------------------------ */
/* Theme context                                                       */
/* ------------------------------------------------------------------ */
const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Movies reducer                                                      */
/* ------------------------------------------------------------------ */
const initialMovies = [
  { id: 1, title: "The God Father", watched: false },
  { id: 2, title: "12 Angry Men", watched: false },
];

function moviesReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, { id: Date.now(), title: action.payload, watched: false }];
    case "TOGGLE_WATCHED":
      return state.map((m) =>
        m.id === action.payload ? { ...m, watched: !m.watched } : m
      );
    case "REMOVE":
      return state.filter((m) => m.id !== action.payload);
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Movie row                                                            */
/* ------------------------------------------------------------------ */
function MovieRow({ movie, onToggle, onRemove }) {
  return (
    <li className="movie-row">
      <span className={"movie-title" + (movie.watched ? " watched" : "")}>
        {movie.title}
      </span>
      <div className="movie-actions">
        <button
          className={"btn btn-sm btn-watched" + (movie.watched ? " is-watched" : "")}
          onClick={() => onToggle(movie.id)}
        >
          {movie.watched ? "Unwatch" : "Watched"}
        </button>
        <button
          className="btn btn-sm btn-remove"
          onClick={() => onRemove(movie.id)}
        >
          Remove
        </button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Favorite Movies (main feature component)                            */
/* ------------------------------------------------------------------ */
function FavoriteMovies() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [movies, dispatch] = useReducer(moviesReducer, initialMovies);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    setInputValue((val) => {
      const trimmed = val.trim();
      if (trimmed) {
        dispatch({ type: "ADD", payload: trimmed });
      }
      return "";
    });
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const handleToggle = useCallback((id) => {
    dispatch({ type: "TOGGLE_WATCHED", payload: id });
  }, []);

  const handleRemove = useCallback((id) => {
    dispatch({ type: "REMOVE", payload: id });
  }, []);

  const stats = useMemo(() => {
    const total = movies.length;
    const watched = movies.filter((m) => m.watched).length;
    return { total, watched };
  }, [movies]);

  return (
    <div className="app-card">
      <h1 className="title">Favorite Movies</h1>

      <form className="input-row" onSubmit={handleAdd}>
        <input
          ref={inputRef}
          type="text"
          className="movie-input"
          placeholder="Add a movie..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="btn btn-add">Add</button>
        <button type="button" className="btn btn-theme" onClick={toggleTheme}>
          Switch to {theme === "light" ? "Dark" : "Light"} Theme
        </button>
      </form>

      <ul className="movie-list">
        {movies.length === 0 && (
          <li className="empty-state">No movies yet — add one above.</li>
        )}
        {movies.map((movie) => (
          <MovieRow
            key={movie.id}
            movie={movie}
            onToggle={handleToggle}
            onRemove={handleRemove}
          />
        ))}
      </ul>

      <div className="stats">
        <div>Total Movies: {stats.total}</div>
        <div>Watched Movies: {stats.watched}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App (default export)                                                */
/* ------------------------------------------------------------------ */
export default function App() {
  return (
    <ThemeProvider>
      <FavoriteMovies />
    </ThemeProvider>
  );
}