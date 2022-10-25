import type { NextPage } from 'next';
import Head from 'next/head';
import { useUser } from '@auth0/nextjs-auth0';
import {Role, User, Game, Comment, GameDTO} from '../models/Types'
import { useEffect, useState } from 'react';
import GameComponent from '../components/GameComponent'
import { db } from '../firebase'
import { addDoc, arrayUnion, collection, collectionGroup, doc, getDoc, getDocs, query, setDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';


const Home: NextPage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [tableInfo, setTableInfo] = useState<any[]>([]);
  const [newGame, setNewGame] = useState(false);
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [points1, setPoints1] = useState(0);
  const [points2, setPoints2] = useState(0);
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    if(user) {
      getDoc(doc(db, 'users', user.email!)).then((dbUser) => {
        console.log(dbUser);
        if(dbUser.exists()){
          user.role = dbUser.data()!.role;
          console.log("Found user with role: ", user.role);
        } else {
          if(user.email?.includes('web2')){
            setDoc(doc(db, 'users', user.email!), {role: 1});
            user.role = 1;
            console.log("New user with role: ", user.role);
          } else {
            setDoc(doc(db, 'users', user.email!), {role: 0});
            user.role = 0;
            console.log("New user with role: ", user.role);
          }
        }
      })
    }
  }, [user])

  useEffect(() => {
    console.log("Starting to get data:", games)
    getGames();
  }, [])

  useEffect(() => {
    let tableInfoObject: any = {};
    games.forEach((game) => {
      let pointDifference = game.team1points - game.team2points;
      if(!tableInfoObject[game.team1]){tableInfoObject[game.team1] = {points: 0, pointDifference: 0}}
      if(!tableInfoObject[game.team2]){tableInfoObject[game.team2] = {points: 0, pointDifference: 0}}
      tableInfoObject[game.team1].pointDifference += pointDifference;
      tableInfoObject[game.team2].pointDifference -= pointDifference;
      if(pointDifference > 0) {
        tableInfoObject[game.team1].points += 3;
      } else if (pointDifference < 0) {
        tableInfoObject[game.team2].points += 3;
      } else {
        tableInfoObject[game.team1].points += 1;
        tableInfoObject[game.team2].points += 1;
      }
    })
    let tableInfoArray: any = [];
    for (var team in tableInfoObject) {
      tableInfoArray.push([team, tableInfoObject[team]]);
    }
    tableInfoArray.sort( (a: any, b: any) => {
      if (b[1]['points'] !== a[1]['points']) return b[1]['points'] - a[1]['points'];
      return b[1]['pointDifference'] - a[1]['pointDifference'];
    })
    setTableInfo([...tableInfoArray])
  }, [games])

  async function getGames() { 
    const gamesSnapshot = await getDocs(collection(db, 'games'));
    let gamesArray: Game[] = [];
    await Promise.all(gamesSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const game: Game = {
        id: doc.id,
        team1: data.team1,
        team2: data.team2,
        team1points: data.team1points,
        team2points: data.team2points,
        comments: await getComments(doc.id)
      }
      gamesArray.push(game);
    }))

    setGames([...gamesArray]);
  }

  async function getComments(gameId: any) {
    const commentsSnapshot = await getDocs(collectionGroup(db, gameId));
    let comments: Comment[] = [];
    commentsSnapshot.forEach(doc => {
      const data = doc.data()
      const comment: Comment = {
        time: data.time,
        id: doc.id,
        email: data.email,
        text: data.text,
      }
      comments.push(comment);
    })
    return comments;
  }

  async function addGame() {
    let game: GameDTO = {
      team1: team1Name,
      team2: team2Name,
      team1points: points1,
      team2points: points2,
    };
    const gameRef = await addDoc(collection(db, 'games'), game)
    setGames([
      ...games,
      {...game, id:gameRef.id, comments:[]}
    ])
    setNewGame(!newGame);
    setTeam1Name('');
    setTeam2Name('');
    setPoints1(0);
    setPoints2(0);
  }

  function removedComment(gameId: string, commentId: string) {
    setGames(
      games.map( game => {
        if(game.id === gameId) {
          game.comments = game.comments.filter(com => com.id !== commentId);
        }
        return game;
      })
    )
  }

  function editedGame(gameId: string, newGame: Game) {
    setGames(
      games.map( game => {
        if(game.id === gameId) {
          return newGame;
        }
        return game;
      })
    )
  }
  
  return (
    <div>
      <Head>
        <title>WEB2-lab1</title>
        <meta name="description" content="WEB2-lab1"/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* HEADER */}
      <div className="top-0 left-0 w-full">
        <div className="flex items-center justify-between filter drop-shadow-md bg-slate-100 h-14 px-4">
            <Link href="/"><a className="text-xl font-semibold">Utakmice demo WEB2-LAB1</a></Link>
            {!user  
              ? <div className="flex gap-4"><p className="text-xl font-semibold text-red-500">Nelogiran</p><Link href="/api/auth/login"><a className="text-xl font-semibold">Login</a></Link></div> 
              : <div className="flex gap-4"><p className="text-xl font-semibold text-green-500">{user?.role === 0 || user?.role === undefined ? 'Korisnik - ' : 'Admin - '}{user?.nickname}</p><Link href="/api/auth/logout"><a className="text-xl font-semibold" >Logout</a></Link></div> 
            }
        </div>
      </div>
      {/* TABLICA */}
      <div className='flex flex-col container max-w-lg bg-slate-200 mx-auto '>
        <div className='border-slate-300 border-2 flex justify-between'>
          <span className='basis-1/2'>Naziv tima</span>
          <span className='basis-1/4'>Broj bodova</span>
          <span className='basis-1/4'>Razlika golova</span>
        </div>
        {tableInfo?.map( (team: any) => (
        <div className='border-slate-300 border-2 flex justify-between' key={team[0]}>
          <span className='basis-1/2 pl-2'>{team[0]}</span>
          <span className='basis-1/4 pl-2'>{team[1].points}</span>
          <span className='basis-1/4 pl-2'>{team[1].pointDifference}</span>
        </div>
        ))}
      </div>
      {/* UTAKMICE I KOMENTARI */}
      <div className="container mx-auto max-w-md flex flex-col  ">
        <>{(!isLoading && user?.role === Role.ADMIN) &&
          <div className='bg-slate-300 text-center flex flex-col py-2 gap-2'>
            {!newGame && 
            <button className='rounded-lg px-2 bg-green-300 w-fit self-center' onClick={() => setNewGame(!newGame)}>Dodaj novu utakmicu</button>}
            {newGame && <>
            <div className='flex gap-2 mx-2'>
              <span>Naziv 1. tima:</span>
              <input type="text" value={team1Name} className=' border-2 border-slate-200' onChange={(e) => setTeam1Name(e.target.value)}></input>
            </div>
            <div className='flex gap-2 mx-2'>
              <span>Naziv 2. tima:</span>
              <input type="text" value={team2Name} className=' border-2 border-slate-200' onChange={(e) => setTeam2Name(e.target.value)}></input>
            </div>
            <div className='flex gap-2 mx-2'>
              <span>Bodovi za {team1Name}:</span>
              <input type="number" min="0" value={points1} className='w-16 border-2 border-slate-200' onChange={(e) => setPoints1(Number(e.target.value))}></input>
            </div>
            <div className='flex gap-2 mx-2'>
              <span>Bodovi za {team2Name}:</span>
              <input type="number" min="0" value={points2} className='w-16 border-2 border-slate-200' onChange={(e) => setPoints2(Number(e.target.value))}></input>
            </div>
            <div className='flex justify-end' >
              <button className='px-2 rounded-lg bg-green-200 mt-2 mr-2' onClick={() => addGame()}>Dodaj igru</button>
              <button className='px-2 rounded-lg bg-red-200 mt-2 mr-2' onClick={() => setNewGame(!newGame)}>Odustani</button>
            </div></>}
          </div>
        }</>
        <div className="flex flex-col">
          {games?.map((game: Game) =>  (
           <GameComponent game={game} user={user} key={game.id} removedComment={removedComment} editedGame={editedGame}/>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
