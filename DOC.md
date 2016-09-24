# Sim Engine Documentation

**Note:** `[brackets]` denote **required** parameters, where `(parentheses)` denote **optional** parameters

# Project Structure

```
git-clone/
..projectName/
....assets/
......image/
........background/
.......... home for background images
........bust/
.......... home for bust images and emotes
......audio/
........effect/
.......... home for effect sounds
........music/
.......... home for music
....main.simfile -- Game Program
..CURRGAME
```

**CURRGAME file must contain the name of your project if you are running in electron**

# Operators

## Asset Operators

`image [type] [name] [filename]`

  * Type can be `bust` or `background`
    * Busts are character images
    * Backgrounds are scene images
  * `name` is what the asset will be called when used in characters or scenes
  * `filename` is the file in the path: `assets/[type]/[filename]`

`image emote [name] [charName] [filename]`

  * used with the `EMOTE [charName] [emoteName]`
  * `charNae` is the character asset ame the emote is used with
  * `filename` is the file in the path: `assets/bust/[filename]`


`audio [type] [name] [filename]`

  * Type can be `music` or `effect`
    * Music is looping audio
    * Effect is played once
  * `name` is what the asset will be called when used in characters or scenes
  * `filename` is the file in the path: `assets/[type]/[filename]`

`script [filename.js]` (untested)

  * Loads a script in the project root folder (not the sim-engine folder)

`style [filename.css]` (untested)

  * Loads a style in the project root folder (not the sim-engine folder)

`scene [name] [type] [value]`

  * `name` is what the asset will be called when using the `SCENE` operator
  * `type` can be `color` or `background`
  * `value`, when used with type `color` will be a hexadecimal color (`#ff00ff`)
  * `value`, when used with type `background` will be the `name` of a `image background` asset

`character [name] [bustName] "[displayName]"`

  * `name` is what the asset will be called when using the `name: "Message"` operator and the inline `otherName: "Hello, :name:"` operator
  * `bustName` is the `name` if the `image bust` asset
  * `displayName` is what name the character will have when displayed in game

## Inline Operators

`:name:`
  
  * Fills in with the matching `character` asset `displayName` parameter
  * Example:
    `girl: "My real name is :girl:"`

`<% javascript() %>`

  * Evals javascript without returning anything
  * Example:
    `GOTOTO mistake <% console.log("this line doesn't work and I'm using this as a debug message") %>`

`<%= javascript() %>`

  * Evals javascript and replaces with return value
  * Example:
    `GOTO <% var opt=["dog","cat","monkey"];opt[Math.floor(Math.random() * opt.length)]` -- goes to a random point in the `opt` array

`%variableName`

  * Notation for game variables, used in inline-scripting
  * Replaces `%name` with string `"gameVars['name']"`
  * Examples (each line is a new example):
    `talk: "Your name is <%= %name || "stupid" %>"`

    `girl: "Hello, %name"`
    `GOTO %name`

`{variableName}`

  * Same as `%variableName` but used in dialog
  * Replaces `{variableName}` with value of `gameVars['variableName']`

## Programming Operators

`"[Display Name]": "[dialog]"` or `[characterName]: "[dialog]"`

  * `characterName` is the `name` attribute of a `character` asset
  * `dialog` is the text that is displayed
  * Sets textbox name to display name of character, or what's in quotes
  * Default character names include:
    * `talk` -- no display name
    * `you` -- "You" display name
  * Appending an `@` at the end of the line will automatically interpret the next line of code (useful with `WAIT` operator)

`ENTER [characterName] (side)` and `EXIT [characterName]`

  * Displays/hides a character in specified location
  * Can **not** display a character in two different locations at the same time
  * `characterName` is the `name` attribute of a `character` asset
  * `side` (optional) can be `LEFT`, `RIGHT`, or nothing (defaults to center)

`EMOTE [characterName] [emote]`

  * Sets a character image without removing the character
  * Matched with `asset image emote [name] [charName] [fileName]`
  * set `emote` to `NONE` to set the character back to default face

`SCENE [sceneName] (transitionTimeMS)`

  * Sets the background to that of a `scene` asset with name `sceneName`
  * Fade animation defaults to 1000MS, but `transitionTimeMS` can be specified
  * When `transitionTimeMS` is specified, the game halts progress until the animation is over

```
MENU "(title)"
  "(responseDisplay)" -> (line)
ENDMENU
```

  * Option dialog where `title` is the question
  * `responseDisplay` is the display name for the option
  * `line` is the line to be run when the option is selected
  * Example Lines:
    `"Eat Apple" -> GOTO apple`
    `"Eat Dog" -> girl: "Don't eat my dog!"`

`MUSIC [option]`

  * `option` is either `STOP` to stop the current music or the `name` of a `audio music` asset
  * Music plays until `MUSIC STOP` is used

`EFFECT [effectName]`

  * Plays the `audio effect` asset with `effectName` name once

`POINT [pointName]`

  * Sets a point for the program to jump to

`GOTO [pointName]`

  * Sets the current program line to `pointName`

`WAIT [time]`

  * Pauses progress for `time` milliseconds

`TEXTBOX [option] (transitionTime)`

  * Option may be `HIDE` or `SHOW` to respectively hide or show the dialog box
  * `transitionTime` defaults to 1000MS

`CENTER [option] (time)` or `CENTER SET "[value]"`

  * Option may be `HIDE`, `SHOW`
  * `HIDE` and `SHOW` respectively hide or show the center text box with a fade duration of `value`
  * `SET` sets the center text with content "`value`"

`IF ([condition]) -> [line]`
  
  * Runs the `line` if `condition` evaluates to true
  * Example:
    `IF (%charisma > 3) -> GOTO tipFedora`

`$ javascript(%varname)`

  * Evaluates a line of javascript