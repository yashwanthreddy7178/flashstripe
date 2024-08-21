"use client";

import { db } from "@/firebase";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Flashcards() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const router = useRouter();

  async function deleteFlashcard(name) {
    if (!user) return; // Ensure the user is defined
    try {
      const docRef = doc(collection(db, 'users'), user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        let collections = docSnap.data().flashcards || [];
        // Remove the flashcard with the specified name
        collections = collections.filter(flashcard => flashcard.name !== name);
  
        console.log('Flashcards before update:', collections);
        await updateDoc(docRef, { flashcards: collections });
        console.log('Flashcards after update:', collections);
        setFlashcards(collections); // Update local state
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  }

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const collections = docSnap.data().flashcards || [];
        setFlashcards(collections);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

  const handleCardClick = (name) => {
    router.push(`/flashcard?id=${name}`);
  };

  const toggleFavorite = async (name) => {
    if (!user) return;
    const docRef = doc(collection(db, "users"), user.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let collections = docSnap.data().flashcards || [];
      collections = collections.map((flashcard) => {
        if (flashcard.name === name) {
          return {
            ...flashcard,
            favorite: !flashcard.favorite,
            favoritedAt: flashcard.favorite ? null : new Date().getTime(),
          };
        }
        return flashcard;
      });

      // Sort the flashcards by favorite status and the time they were favorited
      collections.sort((a, b) => {
        if (b.favorite && a.favorite) {
          return b.favoritedAt - a.favoritedAt;
        }
        return b.favorite - a.favorite;
      });

      await updateDoc(docRef, { flashcards: collections });
      setFlashcards(collections);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom right, #e0f7fa, #80deea)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: "#00796b" }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: "bold", color: "#fff" }}
          >
            FlashcardWizard
          </Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in">
              Login
            </Button>
            <Button color="inherit" href="/sign-up">
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <Button color="inherit" href="/generate">
              Generate
            </Button>
            <Button color="inherit" href="/flashcards">
              My Flashcards
            </Button>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#00796b",
            mb: 4,
            textAlign: "center",
          }}
        >
          Your Flashcard Collections
        </Typography>
        <Grid container spacing={3}>
          {flashcards.map((flashcard, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  overflow: "hidden",
                  position: "relative",
                  transition: "0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <IconButton
                  onClick={() => toggleFavorite(flashcard.name)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: flashcard.favorite ? "#FFD700" : "#ccc",
                    zIndex: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                    },
                  }}
                >
                  {flashcard.favorite ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
                <IconButton
                  onClick={() => deleteFlashcard(flashcard.name)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    color: "#f44336",
                    zIndex: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                  <CardContent
                    sx={{ textAlign: "center", backgroundColor: "#fff" }}
                  >
                    <Typography variant="h6" sx={{ color: "#00796b" }}>
                      {flashcard.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box
        component="footer"
        sx={{
          backgroundColor: "#00796b",
          color: "#fff",
          p: 2,
          textAlign: "center",
        }}
      >
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Quick Links
            </Typography>
            <List sx={{ padding: 0, margin: 0 }}>
              <ListItem sx={{ padding: 0 }}>
                <Button color="inherit" href="/generate">
                  Generate Flashcards
                </Button>
              </ListItem>
              <ListItem sx={{ padding: 0 }}>
                <Button color="inherit" href="/flashcards">
                  My Flashcards
                </Button>
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Contact Us
            </Typography>
            <Typography>Email: support@flashcardsaas.com</Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            &copy; 2024 FlashcardWizard. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
