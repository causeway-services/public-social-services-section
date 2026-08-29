---
title: "Java was a three-day hotfix away from dying horribly on stage"
date: 2026-07-18
draft: false
author: "Nik Koios"
slug: "java-was-a-three-day-hotfix-away-from-dying"
description: "Java was a three-day hotfix away from dying horribly on stage, The Register's account of The Java Story — a programming language documentary that…"
summary: "Java was a three-day hotfix away from dying horribly on stage, The Register's account of The Java Story — a programming language documentary that debuted on YouTube this Friday — identifies the film's organizing theme as the improbable origins of important technologies."
keywords: ["java three hotfix away dying horribly", "technology"]
categories: ["technology"]
references:
  - id: "theregister-com-c96c0ff0"
    type: "webpage"
    title: "Java was a three-day hotfix away from dying horribly on stage"
    URL: "https://www.theregister.com/devops/2026/07/18/java-was-a-three-day-hotfix-away-from-dying-horribly-on-stage/5274590"
    container-title: "theregister.com"
    issued:
      date-parts: [[2026, 7, 18]]
license: "CC BY 4.0"
license_url: "https://creativecommons.org/licenses/by/4.0/"
syndication_rights: "Licensed under Creative Commons Attribution 4.0 International; Koios.News permits indexing, snippets, large image previews, feed distribution, Google Search/News/Discover surfaces, and other attributed downstream syndication."
koios:
  seo_term: "java three hotfix away dying horribly"
  beat: "technology"
  gates_clear: true
  assignment_id: "technology-java-three-hotfix-away-dying-horribly-c2404be7"
  standards_reviewed_at: 2026-07-20T22:00:49.975Z
tweet: "Java was a three-day hotfix away from dying horribly on stage"
---
[Java was a three-day hotfix away from dying horribly on stage](https://www.theregister.com/devops/2026/07/18/java-was-a-three-day-hotfix-away-from-dying-horribly-on-stage/5274590), The Register's account of *The Java Story* — a programming language documentary that debuted on YouTube this Friday — identifies the film's organizing theme as the improbable origins of important technologies. Java's case is more dramatic than most: the language began as a failed attempt at set-top box dominance, nearly died in 1994 after its first sponsor walked away, and then, in 1995, needed a complete threading rewrite three days before its public debut at a major industry conference. The language that now consistently ranks near the top of the TIOBE programming language popularity index and underpins large enterprise applications worldwide survived each crisis in sequence.

## Three days from dying horribly on stage

The first crisis came in 1994. Sun Microsystems had formed an experimental subsidiary called FirstPerson to compete for a Time Warner contract to build interactive video-on-demand software for television set-top boxes. James Gosling wrote a language and runtime for the project, called Oak. The contract went instead to Silicon Graphics, a Sun rival. Sun took the defeat hard, laying off most of FirstPerson's staff and keeping only twelve engineers — among them Gosling and project manager Kim Polese — to continue work on Oak. Tim Lindholm, who had joined just a month before the collapse, told The Register: "We were like refugees in a bombed-out bunker."

The second crisis came a year later and was narrower still. After the set-top box failure, one of the surviving engineers had been experimenting with the recently released Mosaic browser and proposed the World Wide Web as Oak's next target. The team built a Mosaic clone called WebRunner to run animations, a precursor to what would become Java applets. Oak was renamed Java in early 1995, and the team planned to introduce the language at SunWorld, the industry convention that would become JavaOne's predecessor. But the runtime was crashing badly.

Lindholm and fellow new hire Frank Yellin had been assigned the commercial-grade implementation, responsible for making Gosling's advanced concepts — threading and garbage collection — function in practice. Threading proved the harder problem. There were no libraries available to implement it, and Lindholm knew relatively little about the concept. After investigation, he concluded that Java's threading model was "fundamentally broken. It was totally screwed up," he told The Register. The problem lay in system interrupts being issued while the SPARC processor executed an instruction: the system could not recover the state that had been flushed from memory and would therefore "die horribly." The fix required that interrupts happen only at designated points. Three days before the SunWorld conference, Lindholm rewrote the entire threads package. When Sun CEO Scott McNealy demonstrated Java on stage, Lindholm sat in the audience waiting for the worst. The rewrite held. Lindholm and Yellin later co-authored the original JVM specification.

## The engineer who came in from the cold

Lindholm's path to Sun was shaped by accident as much as design, according to The Register. He had been living in a tent in Minnesota during a brutally cold winter, aspiring toward mathematics rather than computing. "Computer science was for people who couldn't be real mathematicians," he said. The cold forced a practical decision: he secured an internship at Argonne National Laboratory in Illinois, where the lab's use of Prolog gave him early experience with virtual machines. "I learned to write to very high-quality virtual machines with things like garbage collection and embeddability," he said. That expertise carried him to Xerox PARC and eventually to Sun, where the knowledge he had not originally sought proved to be precisely what the project required.

## The battles that followed

Java's survival past SunWorld did not end its troubles. In 1996, Microsoft licensed Java for Windows, then added proprietary APIs and declined to support others — a product known as Microsoft's J++. Sun alleged that the changes were designed to undermine Java's cross-platform compatibility and steer developers toward Windows-specific implementations. The legal dispute consumed years of engineering resources. "I spent days in deposition talking about this under oath," Lindholm recalled. The disputes concluded with Microsoft paying Sun nearly $2 billion through a series of settlements, per The Register.

The documentary also covers the informal open-source program Lindholm ran before that term entered common use. Sun distributed the Java binary runtime as a free download and provided source code to anyone who requested it; thousands did. The Java internet domain attracted so much traffic that the team ran what The Register describes as a pirate T3 line into the office. Sun eventually invited Richard Stallman to discuss formal open-source release, but he struck Sun executives as "too radical," Lindholm recalled. Sun would not officially release Java as open source for another decade.

## The film and the company behind it

*The Java Story* joins a genre that Cult.Repo — short for Culture Repository — helped establish: professionally produced documentaries on programming languages, with earlier entries covering C++, Python, and React. Those films originated with Honeypot, a tech recruiting platform that funded them to build its developer audience. In 2019, Honeypot was acquired by XING, which later rebranded as New Work SE. Cult.Repo founder Emma Tracey subsequently bought the production company back from New Work SE, reuniting the original team, according to The Register. *The Java Story* is Cult.Repo's first release under independent ownership.

The film features Gosling alongside Mark Reinhold and Brian Goetz, both senior Oracle Java architects. Where earlier entries in the series required, as The Register put it, "a Hollywood-style effort to construct a Hero's Journey" around slower progressions, Java arrived with what the same publication calls "a veritable Love Island of dramas" already in the record — and enough of them, it turns out, to fill a documentary without embellishment.
