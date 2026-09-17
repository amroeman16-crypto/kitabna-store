import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  AboutPage,
  AccountPage,
  AssistantPage,
  AuthorsPage,
  BookPage,
  BooksPage,
  CartPage,
  Home,
  JournalPage,
  StorefrontShell,
} from "./pages/Home";

function Router() {
  return (
    <StorefrontShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/books" component={BooksPage} />
        <Route path="/books/:id" component={BookPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/assistant" component={AssistantPage} />
        <Route path="/authors" component={AuthorsPage} />
        <Route path="/journal" component={JournalPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/account" component={AccountPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </StorefrontShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
