import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase';
import {Game, CommentDTO, Role} from '../models/Types'
import CommentComponent from './CommentComponent';

const GameComponent = ({game, user, removedComment, editedGame}: {
    game: Game, 
    user: any, 
    removedComment: (gameId: string, commentId: string) => void, 
    editedGame: (gameId: string, newGame: Game) => void
  }) => {
  const [newComment, setNewComment] = useState(false);
  const [updateScore, setUpdateScore] = useState(false);
  const [points1, setPoints1] = useState(game.team1points);
  const [points2, setPoints2] = useState(game.team2points);
  const [commentText, setCommentText] = useState('');

  async function addComment() {
    const comment: CommentDTO = {email: user.email, text: commentText};
    const commentRef = await addDoc(collection(db, 'comments', 'byGame', game.id), comment);
    game.comments.push({...comment, id: commentRef.id});
    setCommentText('');
    setNewComment(!newComment)
  }

  async function editGame() {
    await updateDoc(doc(db, 'games', game.id), {team1points: points1, team2points: points2});
    editedGame(game.id, {
      team1: game.team1,
      team2: game.team2,
      team1points: points1,
      team2points: points2,
      id: game.id,
      comments: game.comments
    })
    setUpdateScore(!updateScore);
  }

  return (
    <div className="my-2 relative">
      <div className='flex flex-col bg-slate-200 rounded-lg'>
        <div className="flex flex-row justify-between p-2">
          <p className='font-bold'>{game.team1} - {game.team2}:</p>
          <p className='font-bold px-2'>{game.team1points} - {game.team2points}</p>
        </div>
      {(user && user.role === Role.ADMIN && !updateScore) &&
      <button className="px-2 rounded-lg bg-blue-200 mb-2 mr-2 w-36 self-end" onClick={() => setUpdateScore(!updateScore)}>Promijeni rezultat</button>}
      {updateScore &&
      <div className='flex flex-col my-2'>
        <div className='flex gap-2 mx-2'>
          <span>Bodovi za {game.team1}:</span>
          <input type="number" min="0" value={points1} className='w-16 border-2 border-slate-200' onChange={(e) => setPoints1(Number(e.target.value))}></input>
        </div>
        <div className='flex gap-2 mx-2'>
          <span>Bodovi za {game.team2}:</span>
          <input type="number" min="0" value={points2} className='w-16 border-2 border-slate-200' onChange={(e) => setPoints2(Number(e.target.value))}></input>
        </div>
        <div className='flex justify-end' >
          <button className='px-2 rounded-lg bg-green-200 mt-2 mr-2' onClick={() => editGame()}>Spremi</button>
          <button className='px-2 rounded-lg bg-red-200 mt-2 mr-2' onClick={() => setUpdateScore(!updateScore)}>Odustani</button>
        </div>
      </div>}
      </div>
      <div className="flex flex-col ml-4 border-l-2 border-slate-200 gap-1">
        {game.comments.map( (comment) => (
          <CommentComponent game={game} user={user} comment={comment} key={comment.id} removedComment={removedComment}/>
        ))}
      </div>
      {(user && !newComment) && 
      <div className='flex justify-end' >
        <button className='px-2 rounded-lg bg-green-200 mt-2 mr-2' onClick={() => setNewComment(!newComment)}>Dodaj komentar</button>
      </div>}
      {newComment &&
      <div className='my-2'>
        <textarea className='w-full border-2 border-slate-200' value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>
        <div className='flex justify-end' >
          <button className='px-2 rounded-lg bg-green-200 mt-2 mr-2' onClick={() => addComment()}>Objavi</button>
          <button className='px-2 rounded-lg bg-red-200 mt-2 mr-2' onClick={() => setNewComment(!newComment)}>Odustani</button>
        </div>
      </div>}
    </div>
  )
}

export default GameComponent;