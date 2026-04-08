// src/components/Loader/Loader.jsx
import "./Loader.css";

export default function Loader({ message = "Entering the Tavern..." }) {
    return (
        <div className="loader-overlay">
            <div className="rpg-spinner"></div>
            <p>{message}</p>
        </div>
    );
}