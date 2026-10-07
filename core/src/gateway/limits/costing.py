_RATES_PER_MILLION: dict[str, tuple[float, float]] = {
    "gemini-3.8-flash": (0.075, 0.30),
}
_DEFAULT_RATE = (0.10, 0.40)


def estimate_cost_usd(model: str, tokens_input: int, tokens_output: int) -> float:
    input_rate, output_rate = _RATES_PER_MILLION.get(model, _DEFAULT_RATE)
    return (tokens_input * input_rate + tokens_output * output_rate) / 1_000_000
