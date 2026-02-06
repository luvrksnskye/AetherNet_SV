# AetherNet - Starvortex Authentication System

Authentication interface for the AetherNet platform, part of the Starvortex ecosystem.

## Structure

```
src/
  components/
    aethernet/    AetherNetApp, SplashScreen, SVCursor
    features/     LoginForm, RegisterForm
    layout/       ConfirmModal
  hooks/          useSVCursor, useSVSounds
  styles/         aethernet.css
  types/          auth.ts
  utils/          validators, formatters, API calls
public/

```

## API

Registration sends POST to `{VITE_BACKEND_URL}/auth/personal/register` with:

```json
{ "name", "age", "gender", "email", "phoneNo", "zipCode", "macAddress", "pwd" }
```

CURP validation currently uses mock data. Replace `fetchCurpData` in `utils/index.ts` with actual endpoint.

## License

Starvortex Systems - Internal use.
