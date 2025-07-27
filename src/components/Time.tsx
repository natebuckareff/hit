export function Time(props: { minutes: string; seconds: string }) {
  return (
    <div class="mt-[5px] font-mono">
      {props.minutes}:{props.seconds}
    </div>
  );
}
