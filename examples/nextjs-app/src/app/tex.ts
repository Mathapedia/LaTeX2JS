
export const tex = String.raw`
\psset{unit=1cm}
\begin{pspicture}(-3.5,-1)(3.75,3.5)

\slider{1}{8}{n}{$N$}{4}

\psplot[algebraic,linewidth=1.5pt,plotpoints=1000]{-3.14}{3.14}{cos(n*x/2)+1.3}
\psaxes[showorigin=false,labels=none, Dx=1.62](0,0)(-3.25,0)(3.25,2.5)

\psline[linestyle=dashed](-3.14,0.3)(3.14,0.3)
\psline[linestyle=dashed](-3.14,2.3)(3.14,2.3)
\rput(3.6,2.3){$\frac{1}{1-\alpha}$}
\rput(3.6,0.3){$\frac{1}{1+\alpha}$}


\rput(3.14, -0.35){$\pi$}
\rput(1.62, -0.35){$\pi/2$}
\rput(-1.62, -0.35){$-\pi/2$}
\rput(-3.14, -0.35){$-\pi$}
\rput(0, -0.35){$0$}

\end{pspicture}




\begin{pspicture}(-2,-2)(2,2)
\psframe(-2,-2)(2,2)
\\userline[linewidth=2pt,linecolor=green]{->}(0,0)(2,2){-x}{-y}
\\userline[linewidth=2pt,linecolor=red]{->}(0,0)(2,2){0}{y}
\\userline[linewidth=2pt,linecolor=purple]{->}(0,0)(2,2){-x}{cos(y)}
\\userline[linewidth=2pt,linecolor=lightblue]{->}(0,0)(2,2)(sin(x)}{-y}
\end{pspicture}

\begin{pspicture}(-5,-5)(5,5)


\rput(0.3,3.75){ $Im$ }
\psline{->}(0,-3.75)(0,3.75)


\rput(3.75,0.3){ $Re$ }
\psline{->}(-3.75,0)(3.75,0)


\pscircle(0,0){ 3 }


 % new vector
\rput(2.3,1){$e^{i\omega}-\alpha$}
\\userline[linewidth=1.5 pt]{->}(1.500,0.000)(2.121,2.121)
\\userline[linewidth=1.5 pt,linecolor=blue]{->}(0,0.000)(2.121,2.121){(x>0) ? 3 * cos( atan(-y/x) ) : -3 * cos( atan(-y/x) ) }{ (x>0) ? -3 * sin( atan(-y/x) ) : 3 * sin( atan(-y/x) )}


\\userline[linewidth=1.5 pt,linestyle=dashed](-1.500,0.000)(2.121,2.121){x}{0}{x}{y}
\\userline[linewidth=1.5 pt,linestyle=dashed](-1.500,0.000)(2.121,2.121){0}{y}{x}{y}


\rput(-0.75,-4.25){$1+\alpha$}
\rput(2.25,-4.25){$1-\alpha$}
\psline{<->}(-3,-4)(1.5,-4)
\psline{<->}(1.5,-4)(3,-4)
\psline[linestyle=dashed](3,-4.5)(3,0)
\psline[linestyle=dashed](-3,-4.5)(-3,0)
\psline[linestyle=dashed](1.5,-4.5)(1.5,0)


\end{pspicture}

Probably the best part of using PSTricks is that you can mix both graphics and mathematics:

\begin{center}
\begin{pspicture}(0,-3)(8,3)

\rput(0,0){$x(t)$}
\rput(4,1.5){$f(t)$}
\rput(4,-1.5){$g(t)$}
\rput(8.2,0){$y(t)$}
\rput(1.5,-2){$h(t)$}

\psframe(1,-2.5)(7,2.5)
\psframe(3,1)(5,2)
\psframe(3,-1)(5,-2)

\rput(4,0){$X_k = \frac{1}{p} \sum \limits_{n=\langle p\rangle}x(n)e^{-ik\omega_0n}$}

\psline[linewidth=1.25 pt]{->}(0.5,0)(1.5,0)
\psline[linewidth=1.25 pt]{->}(1.5,1.5)(3,1.5)
\psline[linewidth=1.25 pt]{->}(1.5,-1.5)(3,-1.5)

\psline[linewidth=1.25 pt]{->}(6.5,1.5)(6.5,0.25)
\psline[linewidth=1.25 pt]{->}(6.5,-1.5)(6.5,-0.25)
\psline[linewidth=1.25 pt]{->}(6.75,0)(7.75,0)
\psline[linewidth=1.25 pt](1.5,-1.5)(1.5,1.5)
\psline[linewidth=1.25 pt](5,1.5)(6.5,1.5)
\psline[linewidth=1.25 pt](5,-1.5)(6.5,-1.5)
\psline[linewidth=1.25 pt](6,-1.5)(6.5,-1.5)

\pscircle(6.5,0){0.25}
\psline(6.25,0)(6.75,0)
\psline(6.5,0.5)(6.5,-0.5)

\end{pspicture}
\end{center}

which can be produced with the following code:

\begin{verbatim}
\rput(0,0){$x(t)$}
\rput(4,1.5){$f(t)$}
\rput(4,-1.5){$g(t)$}
\rput(8.2,0){$y(t)$}
\rput(1.5,-2){$h(t)$}
\psframe(1,-2.5)(7,2.5)
\psframe(3,1)(5,2)
\psframe(3,-1)(5,-2)
\rput(4,0){$X_k = \frac{1}{p} \sum \limits_{n=\langle p\rangle}x(n)e^{-ik\omega_0n}$}
\psline[linewidth=1.25 pt]{->}(0.5,0)(1.5,0)
\psline[linewidth=1.25 pt]{->}(1.5,1.5)(3,1.5)
\psline[linewidth=1.25 pt]{->}(1.5,-1.5)(3,-1.5)
\psline[linewidth=1.25 pt]{->}(6.5,1.5)(6.5,0.25)
\psline[linewidth=1.25 pt]{->}(6.5,-1.5)(6.5,-0.25)
\psline[linewidth=1.25 pt]{->}(6.75,0)(7.75,0)
\psline[linewidth=1.25 pt](1.5,-1.5)(1.5,1.5)
\psline[linewidth=1.25 pt](5,1.5)(6.5,1.5)
\psline[linewidth=1.25 pt](5,-1.5)(6.5,-1.5)
\psline[linewidth=1.25 pt](6,-1.5)(6.5,-1.5)
\pscircle(6.5,0){0.25}
\psline(6.25,0)(6.75,0)
\psline(6.5,0.5)(6.5,-0.5)
\end{verbatim}
`;
