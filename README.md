A forked and adapted version of the original Thoughtworks(R) [Technology Radar](http://thoughtworks.com/radar).

## Original code

Original code and instructions are available in [ThoughtWorks' github repo](https://github.com/thoughtworks/build-your-own-radar).

## Project information

This fork was created and adapted for the EC funded [Cyberwathcing project](https://www.cyberwatching.eu/) (grant agreement no. 740129)

## Changes compared to origianl version

### Added features
Over time this list will be updated with managed branch merges.

#### 1. Fixed blip ids
The original assigns numbers to the blips per quadrant, since blips in that use case are typically identified by their name.
EC projects however from time to time have very similar or even identical acronyms, which makes identifying them only by that very difficult. 
Also, since the data is used elsewhere, cross-referencing by id is far easier.

This is solved by adding a new first column in the Google spreadsheet which carries the project id (a unique number) that is added to the blip object in the code, substituting for the setNumbers() function in Object Radar.

### Removed features

#### 1. No Google auth
Our data is not confidential, and write access to the Google sheet(s) is tightly controlled.

#### 2. No CSV input
Our integration points are Google sheets, which allow for easier collaborative access. Data to be included in the sheets are processed and generated automatically, and write access in general is needed only for adding a new sheet and copying and pasting the data into it.
