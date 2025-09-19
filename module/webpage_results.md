# TIME TAKEN to translate the testing web app using the gemma3:4b model

## Homepage

### it-en:

| Model                | Elapsed Time (frontend)   | Elapsed Time (backend) |
|----------------------|---------------------------|------------------------|
| /translate-one       | 4.77 s                    | calls N.: 34, avg: 746.17 ms, min: 0.00 ms, max: 2596.44 ms, tot: 25369.93 ms |
| /translate-many      | 8.25 s                    | calls N.: 1, avg: 8124.61 ms, min: 8124.61 ms, max: 8124.61 ms, tot: 8124.61 ms |
| after caching        | 0.04 s                    | //                     |

### it-fr:

| Model                | Elapsed Time (frontend)   | Elapsed Time (backend) |
|----------------------|---------------------------|------------------------|
| /translate-one       | 6.26 s                    | calls N: 34, avg: 978.18 ms, min: 0.00 ms, max: 2820.77 ms, tot: 33258.13 ms |
| /translate-many      | 9.13 s                    | calls N.: 1, avg: 9118.20 ms, min: 9118.20 ms, max: 9118.20 ms, tot: 9118.20 ms |
| after caching        | 0.03 s                    | //                     |

## Azienda

### it-en:

| Model                | Elapsed Time (frontend)   | Elapsed Time (backend) |
|----------------------|---------------------------|------------------------|
| /translate-one       | 8.14 s                    | calls N.: 51, avg: 904.61 ms, min: 0.00 ms, max: 2886.07 ms, tot: 46135.23 ms |
| /translate-many      | 15.64 s                   | calls N.: 1, avg: 15541.93 ms, min: 15541.93 ms, max: 15541.93 ms, tot: 15541.93 ms |
| after caching        | 0.05 s                    | //                     |

### it-fr:

| Model                | Elapsed Time (frontend)   | Elapsed Time (backend) |
|----------------------|---------------------------|------------------------|
| /translate-one       | 10.30 s                   | calls N.: 51, avg: 1130.79 ms, min: 0.00 ms, max: 2809.58 ms, tot: 57670.26 ms |
| /translate-many      | 16.10 s                   | calls N.: 1, avg: 15973.49 ms, min: 15973.49 ms, max: 15973.49 ms, tot: 15973.49 ms |
| after caching        | 0.06 s                    | //                     |

## Bevande

### it-en:

| Model                | Elapsed Time (frontend)   | Elapsed Time (backend) |
|----------------------|---------------------------|------------------------|
| /translate-one       | 9.91 s                    | calls N.: 75, avg: 756.29 ms, min: 0.00 ms, max: 2456.99 ms, tot: 56721.75 ms |
| /translate-many      | 20.62 s                   | calls N.: 1, avg: 20494.64 ms, min: 20494.64 ms, max: 20494.64 ms, tot: 20494.64 ms |
| after caching        | 0.07 s                    | //                     |

### it-fr:

| Model                | Elapsed Time (frontend)   | Elapsed Time (backend) |
|----------------------|---------------------------|------------------------|
| /translate-one       | 13.26 s                   | calls N.: 75, avg: 999.90 ms, min: 0.00 ms, max: 3243.52 ms, tot: 74992.31 ms |
| /translate-many      | 21.07 s                   | calls: 1, avg: 20969.14 ms, min: 20969.14 ms, max: 20969.14 ms, tot: 20969.14 ms |
| after caching        | 0.07 s                    | //                     |