// src/App.jsx
import { useState, useEffect } from 'react';
import { gameData } from './data';
import './App.css'; // Tu pourras faire ton design ici

function App() {
  const [tagId, setTagId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('playing'); // 'playing', 'success', 'eliminated'
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Récupérer le tag depuis l'URL (ex: ?tag=1 ou ?tag=start)
    const searchParams = new URLSearchParams(window.location.search);
    const currentTag = searchParams.get('tag');
    setTagId(currentTag);

    // Vérifier si le joueur est déjà éliminé en regardant dans la mémoire de son téléphone
    if (localStorage.getItem('eliminated') === 'true') {
      setStatus('eliminated');
    }

    // Récupérer le nombre de tentatives déjà faites pour ce tag précis
    const savedAttempts = localStorage.getItem(`attempts_${currentTag}`) || 0;
    setAttempts(parseInt(savedAttempts));
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      localStorage.setItem('teamName', inputValue);
      setStatus('success');
      setMessage(gameData.start.nextHint);
    }
  };

  const handleAnswer = (e) => {
    e.preventDefault();
    const tagData = gameData.tags[tagId];
    
    // Nettoyer la réponse : minuscules, pas d'espaces avant/après
    const cleanInput = inputValue.toLowerCase().trim();
    const cleanAnswer = tagData.answer.toLowerCase().trim();

    if (cleanInput === cleanAnswer) {
      setStatus('success');
      setMessage(tagData.successMessage);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem(`attempts_${tagId}`, newAttempts);
      setInputValue(''); // Vider le champ

      if (newAttempts >= 3) {
        setStatus('eliminated');
        localStorage.setItem('eliminated', 'true'); // Élimination définitive
      } else {
        setMessage(`Mauvaise réponse ! Il vous reste ${3 - newAttempts} tentative(s).`);
      }
    }
  };

  // --- RENDUS DE LA PAGE SELON L'ÉTAT ---

  if (status === 'eliminated') {
    return (
      <div className="container">
        <h1>Hunter X Eggs</h1>
        <h2 style={{color: 'red'}}>💀 ÉLIMINÉ 💀</h2>
        <p>Vous avez fait trop d'erreurs. La chasse est terminée pour vous !</p>
      </div>
    );
  }

  if (!tagId) {
    return (
      <div className="container">
        <h1>Hunter X Eggs</h1>
        <p>Veuillez scanner un Tag NFC pour jouer.</p>
      </div>
    );
  }

  // Page d'inscription (Tag de départ)
  if (tagId === 'start') {
    return (
      <div className="container">
        <h1>Hunter X Eggs</h1>
        <h2>{gameData.start.title}</h2>
        {status === 'success' ? (
          <div className="success-box">
            <h3>Inscription validée !</h3>
            <p>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            <p>{gameData.start.message}</p>
            <input 
              type="text" 
              placeholder="Nom de l'équipe..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              required
            />
            <button type="submit">S'inscrire</button>
          </form>
        )}
      </div>
    );
  }

  // Pages des énigmes (Tags 1 à 10)
  const tagData = gameData.tags[tagId];
  if (!tagData) return <div>Tag inconnu...</div>;

  return (
    <div className="container">
      <h1>Hunter X Eggs</h1>
      <h2>Énigme n°{tagId}</h2>
      
      {status === 'success' ? (
        <div className="success-box">
          <h3 style={{color: 'green'}}>Bonne réponse ! 🎉</h3>
          <p>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleAnswer}>
          <p><strong>{tagData.question}</strong></p>
          <input 
            type="text" 
            placeholder="Votre réponse..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
          />
          <button type="submit">Soumettre</button>
          {message && <p style={{color: 'orange'}}>{message}</p>}
        </form>
      )}
    </div>
  );
}

export default App;