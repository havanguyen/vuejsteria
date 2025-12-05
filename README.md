# Vuejsteria (Bookteria)

Vuejsteria is a modern, feature-rich e-commerce application built with Vue 3 and Vite. It serves as a comprehensive template and demonstration of a scalable frontend architecture, featuring a complete shopping experience for users and a robust administration panel for managers.

## Features

### Client Side
-   **Home Page**: Showcases featured products and promotions.
-   **Product Catalog**: Browse and search for books with advanced filtering.
-   **Product Details**: Detailed view of book information, reviews, and related items.
-   **Shopping Cart**: Manage items, update quantities, and view totals.
-   **Checkout**: Secure checkout process with address selection and payment integration.
-   **Order History**: Track past orders and view order status.
-   **User Profile**: Manage personal information and addresses.
-   **Authentication**: Secure Login and Registration flows.

### Admin Panel
-   **Dashboard**: Overview of sales, orders, and key metrics.
-   **Management**: Tools to manage products, orders, and users.

## Tech Stack

-   **Core**: [Vue 3](https://vuejs.org/) (Composition API), [Vite](https://vitejs.dev/)
-   **State Management**: [Pinia](https://pinia.vuejs.org/) (with persistence via `pinia-plugin-persistedstate`)
-   **UI Framework**: [Vuetify 3](https://vuetifyjs.com/)
-   **Routing**: [Vue Router 4](https://router.vuejs.org/)
-   **HTTP Client**: [Axios](https://axios-http.com/)
-   **Form Validation**: [Vee-Validate](https://vee-validate.logaretm.com/v4/) & [Zod](https://zod.dev/)
-   **Data Visualization**: [Chart.js](https://www.chartjs.org/) & [Vue-Chartjs](https://vue-chartjs.org/)
-   **Utilities**: `date-fns` for date manipulation, `jwt-decode` for token handling.

## Prerequisites

-   **Node.js**: Version `^20.19.0` or `>=22.12.0` is required.

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd vuejsteria
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

The application uses configuration files located in `src/config`.
-   **API Configuration**: `src/config/constants.js` defines the `API_BASE_URL`.
    -   Default: `https://api.bookteria.click/api/v1`

## Running the Application

### Development
To start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Production Build
To build the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
src/
├── api/            # API service modules
├── components/     # Reusable Vue components
├── config/         # App configuration (constants, axios setup)
├── plugins/        # Vue plugins (Vuetify, etc.)
├── router/         # Vue Router configuration
├── stores/         # Pinia state stores
├── utils/          # Helper functions
├── validations/    # Form validation schemas
└── views/          # Page components (routed views)
    ├── admin/      # Admin panel pages
    ├── auth/       # Authentication pages
    ├── profile/    # User profile pages
    └── ...         # Other public pages
```

## Recommended IDE Setup

-   [VS Code](https://code.visualstudio.com/)
-   [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension
