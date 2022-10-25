import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase';
import {Game, CommentDTO, Comment, Role} from '../models/Types'

const CommentComponent = ({game, user, comment, removedComment}: {game: Game, user: any, comment: Comment, removedComment: (gameId: string, commentId: string) => void}) => {
  const [updateComment, setUpdateComment] = useState(false);
  const [commentText, setCommentText] = useState(comment.text);

  async function editComment() {  
    await updateDoc(doc(db, 'comments', 'byGame', game.id, comment.id), {text: commentText});
    comment.text = commentText;
    setUpdateComment(!updateComment);
  }

  async function deleteComment() {
    await deleteDoc(doc(db, 'comments', 'byGame', game.id, comment.id));
    // console.log(typeof(removedComment));
    removedComment(game.id, comment.id);
  }

  return (
    <div className='bg-gray-100 flex flex-col'>
      <div className="break-words">
        <span className='italic'>{comment.time}&nbsp;</span>
        <span className="font-semibold">{comment.email.split("@")[0]}:&nbsp;</span>
        <span className="text-neutral-700">{comment.text}</span>
      </div>
      {user &&
      <div className='self-end'>
        {user.email === comment.email && !updateComment && 
        <button onClick={() => setUpdateComment(!updateComment)} className='px-2 rounded-lg bg-blue-200 m-2 w-14'>Uredi</button>}
        {user.role === Role.ADMIN && 
        <button onClick={() => deleteComment()} className='px-2 rounded-lg bg-red-200 m-2 w-14'>Obriši</button>}
      </div>}
      {updateComment && 
      <div className='my-2'>
        <textarea className='w-full border-2 border-slate-200' value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>
        <div className='flex justify-end' >
          <button className='px-2 rounded-lg bg-green-200 mt-2 mr-2' onClick={() => editComment()}>Spremi</button>
          <button className='px-2 rounded-lg bg-red-200 mt-2 mr-2' onClick={() => setUpdateComment(!updateComment)}>Odustani</button>
        </div>
      </div>}
    </div>
  )
}
  
export default CommentComponent;