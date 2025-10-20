import pandas as pd

def detect_implausible_fares(file_path="uber.csv"):
    df = pd.read_csv(file_path)

 
    df['fare_amount'] = pd.to_numeric(df['fare_amount'], errors='coerce')
    df = df.dropna(subset=['fare_amount'])

    negative_count = int((df['fare_amount'] < 0).sum())
    zero_count = int((df['fare_amount'] == 0).sum())
    too_high_count = int((df['fare_amount'] > 500).sum())
    too_low_count = int((df['fare_amount'] < 2.5).sum())

    total_implausible = negative_count + zero_count + too_high_count + too_low_count

    print(f"Negative fares: {negative_count}")
    print(f"Zero fares: {zero_count}")
    print(f"Too high (>$500): {too_high_count}")
    print(f"Too low (<$2.50): {too_low_count}")
    print(f"Total implausible: {total_implausible}")

    return {
        "negative": negative_count,
        "zero": zero_count,
        "too_high": too_high_count,
        "too_low": too_low_count,
        "total_implausible": total_implausible
    }

if __name__ == "__main__":
    file_path = "uber.csv"
    detect_implausible_fares(file_path=file_path)
