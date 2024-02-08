import logo from "../assets/logo.svg"
import { Link, NavLink } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage  } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Search, PlusCircle, LogOut, User } from "lucide-react";
import LoginSignupDialog from "./LoginSignupDialog";

const Header = () => {
  const isGuest = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background mx-auto flex p-3 lg:px-16 items-center justify-end">
      <NavLink to="/" className="inline-flex -order-1 items-center gap-2">
        <img src={logo} width={38} alt="RideShare" />
        <h1 className="font-bold text-xl text-primary hidden sm:block">RideShare</h1>
      </NavLink>
      <nav className="ml-auto flex items-center text-base justify-center">
        <NavLink to="/search" className="flex items-center gap-2 mr-5 hover:text-primary"><Search className="h-4 w-4" />Search</NavLink>
        <NavLink to="/offer-seat" className="flex items-center gap-2 mr-5 hover:text-primary"> <PlusCircle className="h-4 w-4"/> Publish a ride</NavLink>
      </nav>
      {isGuest ?
        <LoginSignupDialog />
        :
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>Profile</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/profile" className="flex">
                <User className="mr-2 h-4 w-4"/><span>Profile</span>
              </Link>
              </DropdownMenuItem>
            <DropdownMenuItem><LogOut className="mr-2 h-4 w-4"/><span>Log Out</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    </header>
  )
}

export default Header