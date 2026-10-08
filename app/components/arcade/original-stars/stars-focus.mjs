/** DOM removal can emit focusout with relatedTarget=null before focus settles. */
export function installGameFocusGuard(container, game) {
  let disposed = false, revision = 0;
  const onFocusOut = () => {
    const current = ++revision;
    queueMicrotask(() => {
      if (!disposed && current === revision && game.state === 'playing' &&
          !container.contains(container.ownerDocument.activeElement)) game.pause();
    });
  };
  container.addEventListener('focusout', onFocusOut);
  return () => { disposed = true; revision++; container.removeEventListener('focusout', onFocusOut); };
}
