'use client'

import { db } from "@/firebase";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import { collection, doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [generationsLeft, setGenerationsLeft] = useState(3); // default to 3 generations
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserGenerations();
    }
  }, [isLoaded, isSignedIn]);
  
  const fetchUserGenerations = async () => {
    if (!user) return;
    const userDocRef = doc(collection(db, 'users'), user.id);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      if (data.generationsLeft !== undefined) {
        setGenerationsLeft(data.generationsLeft);
      } else {
        await updateDoc(userDocRef, { generationsLeft: 3 });
        setGenerationsLeft(3);
      }
    } else {
      await setDoc(userDocRef, { generationsLeft: 3 });
      setGenerationsLeft(3);
    }
  };

  const handleSubmit = async () => {
    if (generationsLeft > 0) {
      // Generate flashcards
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: text,
      });
      const data = await res.json();
      setFlashcards(data);
  
      // Decrease generations left
      const newGenerationsLeft = generationsLeft - 1;
      setGenerationsLeft(newGenerationsLeft);
  
      // Update the user's document in Firestore
      const userDocRef = doc(collection(db, 'users'), user.id);
      await updateDoc(userDocRef, { generationsLeft: newGenerationsLeft });
    } else {
      // Redirect to pricing page if no generations left and user tries to generate
      router.push('/');
    }
  };

  const handleCardClick = () => {
    setFlipped(!flipped);
  };

  const handleNextCard = () => {
    setFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveFlashcards = async () => {
    if (!name) {
      alert('Please enter a name');
      return;
    }
    const batch = writeBatch(db);
    const userDocRef = doc(collection(db, 'users'), user.id);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const collections = docSnap.data().flashcards || [];
      if (collections.find((f) => f.name == name)) {
        alert('Flashcard collection with the same name already exists.');
        return;
      } else {
        collections.push({ name });
        batch.set(userDocRef, { flashcards: collections }, { merge: true });
      }
    } else {
      batch.set(userDocRef, { flashcards: [{ name }] });
    }

    const colRef = collection(userDocRef, name);
    flashcards.forEach((flashcard) => {
      const cardDocRef = doc(colRef);
      batch.set(cardDocRef, flashcard);
    });

    await batch.commit();
    handleClose();
    router.push('/flashcards');
  };

  if (!isLoaded) {
    return <Typography>Loading...</Typography>;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(to bottom right, #e0f7fa, #80deea)', 
        minHeight: '100vh', 
        width: '100%', 
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar sx={{ backgroundColor: '#00796b' }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#fff' }}>
          FlashcardWizard
        </Typography>
        <Button color="inherit" href="/flashcards">My Flashcards</Button>
        <Button color="inherit" href="/">Pricing</Button>
      </Toolbar>

      <Box
        sx={{
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2vh 2vw',
        }}
      >
        <Box
          sx={{
            mt: { xs: 2, md: 4 },
            mb: { xs: 4, md: 6 },
            display: "flex",
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#00796b', 
              mb: 2,
              fontSize: { xs: '1.8rem', md: '2.5rem' } 
            }}
          >
            Generate Flashcards
          </Typography>
          <Paper sx={{ p: 4, width: '100%', maxWidth: '800px', boxShadow: 3, borderRadius: 2 }}>
            <TextField
              value={text}
              onChange={(e) => setText(e.target.value)}
              label="Enter text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              sx={{
                mb: 2,
              }}
            />
            <Button
              variant="contained" 
              color="primary" 
              onClick={handleSubmit} 
              fullWidth
              sx={{ boxShadow: 2 }}
            >
              Generate ({generationsLeft})
            </Button>
          </Paper>
        </Box>

        {flashcards.length > 0 && (
          <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handlePrevCard} disabled={flashcards.length === 1}>
              <ArrowBackIosIcon fontSize="large" />
            </IconButton>
            <Box
              sx={{
                width: '60vw', 
                height: '40vh',
                perspective: '1000px',
              }}
            >
              <Box
                onClick={handleCardClick}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.6s',
                  cursor: 'pointer',
                }}
              >
                <Card
                  sx={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    backfaceVisibility: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: 3, 
                    borderRadius: 2,
                    padding: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ 
                      color: '#00796b',
                      fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                    }}
                  >
                    {flashcards[currentIndex].front}
                  </Typography>
                </Card>
                <Card
                  sx={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    backfaceVisibility: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: 3, 
                    borderRadius: 2,
                    padding: 2,
                    overflow: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ 
                      color: '#00796b',
                      fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      lineHeight: 1.2,
                    }}
                  >
                    {flashcards[currentIndex].back}
                  </Typography>
                </Card>
              </Box>
            </Box>
            <IconButton onClick={handleNextCard} disabled={flashcards.length === 1}>
              <ArrowForwardIosIcon fontSize="large" />
            </IconButton>
          </Box>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="secondary" onClick={handleOpen} sx={{ boxShadow: 2 }} disabled={flashcards.length === 0}>
            Save 
          </Button>
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle> Save Flashcards </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your flashcards collection
          </DialogContentText>
          <TextField 
            autoFocus 
            margin="dense" 
            label="Collection Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={saveFlashcards}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
