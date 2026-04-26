# config.py

ACTION_MAP = {
    -1: 0,  # apply integral
    0: 1,   # unknown
    1: 2,   # simplify
    2: 3,   # expand
    3: 4,   # factor
    4: 5,   # power
    5: 6,   # split
    6: 7,   # substitution
    7: 8,   # by parts
    8: 9    # apply bounds
}

NUM_ACTIONS = len(ACTION_MAP)

EMBED_SIZE = 128
HIDDEN_SIZE = 256