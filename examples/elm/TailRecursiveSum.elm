mySum : List Int -> Int -> Int
mySum xs accumulated =
    case xs of
        [] ->
            accumulated

        first :: rest ->
            mySum rest (accumulated + first)
