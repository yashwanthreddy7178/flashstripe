import { SignIn } from '@clerk/nextjs';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <Container 
      maxWidth="100vw" 
      sx={{ 
        background: 'linear-gradient(to bottom right, #e0f7fa, #80deea)', // Gradient background
        minHeight: '100vh', // Ensure full height
        padding: '20px', // Add some padding
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              color: '#fff',
              fontSize: '1.5rem' // Increased font size for better visibility
            }}
          >
            <Link href="/" passHref>
              <span style={{ textDecoration: 'none', color: '#fff' }}>FlashcardWizard</span>
            </Link>
          </Typography>
          <Button color="inherit">
            <Link href="/sign-in" passHref>
              Login
            </Link>
          </Button>
          <Button color="inherit">
            <Link href="/sign-up" passHref>
              Sign Up
            </Link>
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{ 
          backgroundColor: '#fff', 
          padding: '40px', 
          borderRadius: '8px', 
          boxShadow: 3, 
          marginTop: '40px',
          width: '100%', // Full width for the sign-in box
          maxWidth: '400px' // Limit max width for better aesthetics
        }}
      >
        <Typography 
          variant="h3" // Increased font size for the sign-in title
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: '#3f51b5',
            textAlign: 'center', // Center the sign-in text
            marginBottom: '20px' // Add space below the title
          }}
        >
          Sign In
        </Typography>
        <SignIn />
      </Box>
    </Container>
  );
}