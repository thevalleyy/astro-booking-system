To build an admin page using **Next.js** and **Node.js** that requires authentication, you can leverage the server-side rendering (SSR) features of Next.js and cookies for user authentication. Here’s a step-by-step guide:

---

### 1. **Set Up Authentication**

#### Backend: Node.js API for Authentication
Create a simple API route to handle login and set cookies for authenticated users.

```javascript
// pages/api/login.js
import { serialize } from "cookie";

export default function handler(req, res) {
    if (req.method === "POST") {
        const { password } = req.body;

        // Replace "your-secure-password" with your actual admin password
        if (password === "your-secure-password") {
            const cookie = serialize("auth", "authenticated", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24, // 1 day
            });

            res.setHeader("Set-Cookie", cookie);
            return res.status(200).json({ message: "Login successful" });
        }

        return res.status(401).json({ message: "Invalid password" });
    }
    res.status(405).json({ message: "Method not allowed" });
}
```

#### Logout API Route
Add an API route to handle logout by clearing the cookie.

```javascript
// pages/api/logout.js
import { serialize } from "cookie";

export default function handler(req, res) {
    const cookie = serialize("auth", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 0,
    });

    res.setHeader("Set-Cookie", cookie);
    res.status(200).json({ message: "Logged out" });
}
```

---

### 2. **Protect the Admin Page**

Use `getServerSideProps` to check for the `auth` cookie on the server and redirect unauthenticated users to the login page.

```javascript
// pages/admin.js
export async function getServerSideProps({ req }) {
    const { auth } = req.cookies;

    if (auth !== "authenticated") {
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }

    return {
        props: {}, // Pass additional data if needed
    };
}

export default function AdminPage() {
    return (
        <div>
            <h1>Admin Table</h1>
            {/* Your table and admin interface */}
        </div>
    );
}
```

---

### 3. **Create the Login Page**

A simple login form that sends the password to the `/api/login` route.

```javascript
// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            router.push("/admin");
        } else {
            const { message } = await res.json();
            setError(message);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
```

---

### 4. **Add Logout Functionality**

Provide a logout button on the admin page.

```javascript
// Inside the AdminPage component
const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
};

return (
    <div>
        <h1>Admin Table</h1>
        <button onClick={handleLogout}>Logout</button>
        {/* Your table and admin interface */}
    </div>
);
```

---

### 5. **Style and Populate the Table**

You can now create your table directly within the `AdminPage` component, using SSR to fetch and pass data.

```javascript
export async function getServerSideProps({ req }) {
    const { auth } = req.cookies;

    if (auth !== "authenticated") {
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }

    // Fetch your table data here
    const data = await fetch("https://api.example.com/data").then((res) =>
        res.json()
    );

    return {
        props: { data },
    };
}

export default function AdminPage({ data }) {
    return (
        <div>
            <h1>Admin Table</h1>
            <table>
                <thead>
                    <tr>
                        {Object.keys(data[0]).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx}>
                            {Object.values(row).map((value, idx) => (
                                <td key={idx}>{value}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
```

---

### Summary

1. Use **API routes** to handle login/logout and manage cookies for authentication.
2. Use **`getServerSideProps`** to protect the admin page and fetch data server-side.
3. Split your UI into distinct pages (`/login`, `/admin`) for simplicity and better maintainability.
4. Use cookies for authentication, avoiding the need to build your page with JavaScript dynamically.

This approach ensures a clean, server-rendered admin page with secure, cookie-based authentication.