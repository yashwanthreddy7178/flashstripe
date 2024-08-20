"use client";

import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  List,
  ListItem,
  Toolbar,
  Typography,
} from "@mui/material";
import Head from "next/head";
import { useState } from "react"; // Import useState from React

export default function Home() {
  const [loading, setLoading] = useState(false); // Now useState is correctly defined

  const handleSubmit = async (plan) => {
    if (loading) return; // Prevent multiple submissions
    setLoading(true);

    try {
      const checkoutSession = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
        },
        body: JSON.stringify({ plan }),
      });

      const checkoutSessionJson = await checkoutSession.json();

      if (checkoutSession.statusCode === 500) {
        console.error(checkoutSession.message);
        return;
      }

      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJson.id,
      });

      if (error) {
        console.warn(error.message);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom right, #e0f7fa, #80deea)", // Soft gradient background
        minHeight: "100vh", // Ensure full height
        width: "100%", // Ensure full width
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Head>
        <title>FlashcardWizard</title>
        <meta name="description" content="Create flashcards from text" />
      </Head>

      <AppBar position="static" sx={{ backgroundColor: "#00796b" }}>
        <Toolbar>
          <Typography
            variant="h6"
            style={{ flexGrow: 1, fontWeight: "bold", color: "#fff" }}
          >
            FlashcardWizard
          </Typography>
          <Button color="inherit" href="/generate" sx={{ mr: 2 }}>
            Generate
          </Button>
          <Button color="inherit" href="/flashcards" sx={{ mr: 2 }}>
            My Flashcards
          </Button>
          <SignedOut>
            <Button color="inherit" href="/sign-in">
              Login
            </Button>
            <Button color="inherit" href="/sign-up">
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Container
        sx={{
          flexGrow: 1, // Ensure the container grows to fill the space
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", // Center content vertically
          alignItems: "center", // Center content horizontally
          padding: 0,
          margin: 0,
          width: "100%",
        }}
      >
        <Box sx={{ textAlign: "center", my: 4, color: "#333" }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Welcome to FlashcardWizard
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Welcome to our wild world of words and wonders! We’re here to
            sprinkle a little magic on your memory-making process. Imagine
            diving deep into your favorite topics and conjuring up flashcards
            that spark joy and ignite your curiosity. Let your imagination run
            free, because the story you weave with us can turn learning into an
            adventure!.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2, mr: 2 }}
            href="/generate"
          >
            Get Started
          </Button>
        </Box>

        <Box sx={{ my: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#00796b", textAlign: "center" }}
          >
            Features
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  textAlign: "center",
                  transition: "0.3s",
                  height: "100%", // Ensure full height
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between", // Evenly distribute content
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Easy Text Input
                  </Typography>
                  <Typography>
                    Simply input your text and let our software do the rest.
                    Creating flashcards has never been easier.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  textAlign: "center",
                  transition: "0.3s",
                  height: "100%", // Ensure full height
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between", // Evenly distribute content
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Smart Flashcards
                  </Typography>
                  <Typography>
                    Our AI intelligently breaks down your text into concise
                    flashcards, perfect for studying.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 2,
                  textAlign: "center",
                  transition: "0.3s",
                  height: "100%", // Ensure full height
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between", // Evenly distribute content
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Accessible Anywhere
                  </Typography>
                  <Typography>
                    Access your flashcards from any device, at any time. Study
                    on the go with ease.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box id="pricing-section" sx={{ my: 6, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#00796b" }}
          >
            Pricing
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  boxShadow: 3,
                  height: "100%", // Ensure full height
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between", // Evenly distribute content
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    Basic
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    $5 / month
                  </Typography>
                  <Typography>
                    Access to basic flashcard features and limited storage.
                  </Typography>
                </CardContent>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => handleSubmit('basic')}>
                  Choose Basic
                </Button>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  boxShadow: 3,
                  height: "100%", // Ensure full height
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between", // Evenly distribute content
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    Pro
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    $10 / month
                  </Typography>
                  <Typography>
                    Unlimited flashcards and storage, with priority support.
                  </Typography>
                </CardContent>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => handleSubmit('pro')}
                >
                  Choose Pro
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Box
        component="footer"
        sx={{
          backgroundColor: "#00796b", // Match the AppBar color
          color: "#fff",
          py: 3,
          mt: "auto", // Push footer to the bottom
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                FlashcardWizard
              </Typography>
              <Typography variant="body2">
                The easiest way to create and manage your flashcards.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Quick Links
              </Typography>
              <List sx={{ padding: 0, margin: 0 }}>
                <ListItem sx={{ padding: 0 }}>
                  <Button
                    href="/generate"
                    color="inherit"
                    sx={{ textTransform: "none", padding: 0 }}
                  >
                    Generate Flashcards
                  </Button>
                </ListItem>
                <ListItem sx={{ padding: 0 }}>
                  <Button
                    href="/flashcards"
                    color="inherit"
                    sx={{ textTransform: "none", padding: 0 }}
                  >
                    My Flashcards
                  </Button>
                </ListItem>
                <ListItem sx={{ padding: 0 }}>
                  <Button
                    href="#pricing-section"
                    color="inherit"
                    sx={{ textTransform: "none", padding: 0 }}
                  >
                    Pricing
                  </Button>
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Follow Us
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button href="#" color="inherit" sx={{ padding: 0 }}>
                  <img src="/facebook.svg" alt="Facebook" width="24" />
                </Button>
                <Button href="#" color="inherit" sx={{ padding: 0 }}>
                  <img src="/twitter.svg" alt="Twitter" width="24" />
                </Button>
                <Button href="#" color="inherit" sx={{ padding: 0 }}>
                  <img src="/linkedin.svg" alt="LinkedIn" width="24" />
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2">
              &copy; {new Date().getFullYear()} FlashcardWizard. All rights
              reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
