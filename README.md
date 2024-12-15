# Gossip Space

## Running locally

To run the game locally, you need to have Deno v2 installed. Instructions for installing Deno can be found [here](https://docs.deno.com/runtime/getting_started/installation/).

Once you have Deno installed, install the packages needed to run the game by running the following command:

```sh
deno install --allow-scripts=npm:canvas@3.0.0-rc2
```

Generate Deno and React Router types so that typescript doesn't complain:

```sh
deno task typegen
```

Create a `.env` file in the root of the project and add the following:

```sh
OPENAI_API_KEY=your-openai-key
```

After installing the packages, generating types, and configuring openai key, you can run the game:

```sh
deno task dev
```

# Credits

## Great Icosahedron model used for the player model

"Great Icosahedron" (https://skfb.ly/SpqZ) by PTham is licensed under Creative
Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

## Example of Deno and React Router setup

[https://github.com/redabacha/react-router-deno-template](https://github.com/redabacha/react-router-deno-template)