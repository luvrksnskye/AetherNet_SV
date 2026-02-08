
# AetherNet — Starvortex Authentication System

## Structure

```
src/
  components/
    aethernet/    AetherNetApp, SplashScreen, SVCursor
    features/     LoginForm, RegisterForm, Dashboard
  hooks/          useSVCursor, useSVSounds
  styles/         aethernet.css
  types/          auth.ts
  utils/          index.ts
public/
  sfx/          
                
```
## API

**Register** — `POST /users`

```json
{
  "name": "Admin Aether",
  "age": 18,
  "gender": "M",
  "email": "admin@aethernet.com",
  "phoneNo": "5555555555",
  "ipAddress": "127.0.0.1",
  "pwd": "supersecretpassword"
}
```

**Login** — Not yet wired to backend (mock 1.5s delay, always succeeds).
